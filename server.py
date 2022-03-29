# -*- coding: utf-8 -*-
import os.path
import cherrypy
import time
import copy

import socket
import sys
import struct

import argparse

from server_executor import Executor 

my_parser = argparse.ArgumentParser()
my_parser.add_argument('--port', action='store', type=int, default=8080)
my_parser.add_argument('--warmstart', dest='warmstart', action='store_true')
my_parser.add_argument('--no-warmstart', dest='warmstart', action='store_false')
my_parser.add_argument('--udp', dest='udp', action='store_true')
my_parser.add_argument('--no-udp', dest='udp', action='store_false')
my_parser.set_defaults(warmstart=True, udp=False)
my_parser.add_argument('--base_url', action='store', type=str, default='')

args = my_parser.parse_args()

if args.udp:
  s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  s.bind(("",9090))


# --------------------------------------------------------------------------------------------------- #
# ------------------------------------- Instantiate Executor ---------------------------------------- #
# --------------------------------------------------------------------------------------------------- #

exe = Executor()

# --------------------------------------------------------------------------------------------------- #
# --------------------------- Define exposed methods inside Root class ------------------------------ #
# --------------------------------------------------------------------------------------------------- #

class Root:
    def __init__(self):
      if args.warmstart:
        exe.warmstart()
      self.triggered = False

    @cherrypy.expose
    def index(self, **kwargs):
        raise cherrypy.HTTPRedirect(args.base_url+"/index.html")

    # @cherrypy.expose
    # def control(self, **kwargs):
    #     raise cherrypy.HTTPRedirect(args.base_url+"/index.html")

    # ------------------------------------------------------------------------------- #
    # ---------------------------- Root: Get OCP Result ----------------------------- #
    # ------------------------------------------------------------------------------- #

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def get_ocp_result(self, **kwargs):
      input_json = cherrypy.request.json
      print("get_ocp_result", input_json)
      # return exe.compute(input_json)
      return exe.test_compute(input_json)

    # ------------------------------------------------------------------------------- #
    # --------------------------- Root: Get Sense World ----------------------------- #
    # ------------------------------------------------------------------------------- #

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def get_sense_world(self, **kwargs):
      input_json = cherrypy.request.json
      print("get_sense_world", input_json)
      return exe.sense_world(input_json)

      
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def get_result_dictionary(self):
      print("triggered?",self.triggered)
      if self.triggered:
        self.triggered = False
        return exe.get_result_dictionary()
      else:
        return {}

    @cherrypy.expose
    def trigger_run(self):
      self.triggered = True

    if args.udp:
      @cherrypy.expose
      def poll(self):
        cherrypy.response.headers['Content-Type'] = 'application/octet-stream'
        def content():
          rate_limit = 10 # ms
          
          while True:
            try:
                r = s.recv(1000)
                yield s.recv(1000)
            except:
              pass
        return content()

      poll._cp_config = {'response.stream': True}

# --------------------------------------------------------------------------------------------------- #
# -------------------------------- Basic configuration in Cherrypy ---------------------------------- #
# --------------------------------------------------------------------------------------------------- #

location = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'front-end/build')

conf = {
     '/': {
         'tools.staticdir.on': True,
         'tools.staticdir.dir': '',
         'tools.staticdir.root': location,
     }
}

print("NOTE: for live streaming from the crane in firefox, you need to adapt about:config first:")
print(" dom.streams.enabled=true, javascript.options.streams=true")
print(" cfr. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch")


cherrypy.tree.mount(Root(), '/', conf)

cherrypy.server.socket_host = '0.0.0.0'
cherrypy.server.socket_port = args.port

print(args)
cherrypy.engine.start()
cherrypy.engine.block()
