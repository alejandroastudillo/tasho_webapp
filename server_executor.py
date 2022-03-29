# -*- coding: utf-8 -*-
import os.path
import cherrypy
import time
import copy

import socket
import sys
import struct

import argparse

# --------------------------------------------------------------------------------------------------- #
# ----------------------- Define usual python methods inside Executor class ------------------------- #
# --------------------------------------------------------------------------------------------------- #

class Executor:
  def __init__(self):
    self.cache = {}
    import rockit
    import casadi

    # --------------------------------------------------------------------
    import sys
    from tasho import task_prototype_rockit as tp
    from tasho import input_resolution
    from tasho import robot as rob
    import casadi as cs
    from casadi import pi, cos, sin
    from rockit import MultipleShooting, Ocp
    # --------------------------------------------------------------------

    from collections import OrderedDict

    self.globals = dict(rockit.__dict__)
    self.globals.update(casadi.__dict__)
    tanh = casadi.tanh

    def soft_if_else(lhs,rhs,t,f):
      #return if_else(lhs<=rhs,t,f)
      d = (tanh(100*(lhs-rhs))+1)/2
      return (1-d)*t+d*f
    self.globals["soft_if_else"] = soft_if_else

    self.globals["OrderedDict"] = OrderedDict

    self.result = dict()


  # ------------------------------------------------------------------------------- #
  # --------------------------- Executor: Setting code ---------------------------- #
  # ------------------------------------------------------------------------------- #

  # ----------------------------------------------------------------------
  
  def code_setup_tasho(self, state):
    ocp_string = """
horizon_size = 100
t_mpc = 0.05
max_joint_acc = 30*3.14159/180

robot = rob.Robot('ur10')

robot.set_joint_acceleration_limits(lb = -max_joint_acc, ub = max_joint_acc)

tc = tp.task_context(horizon_size * t_mpc, horizon_steps=horizon_size)

q, q_dot, q_ddot, q0, q_dot0 = input_resolution.acceleration_resolved(tc, robot, {})

#computing the expression for the final frame
fk_vals = robot.fk(q)[robot.ndof]

final_pos = {'hard':True, 'expression':fk_vals[0:3, 3], 'reference':[0.67, 0.53, -0.2]}
final_vel = {'hard':True, 'expression':q_dot, 'reference':0}
final_constraints = {'final_constraints':[final_pos, final_vel]}
tc.add_task_constraint(final_constraints)

#adding penality terms on joint velocity and position
vel_regularization = {'hard': False, 'expression':q_dot, 'reference':0, 'gain':1}
acc_regularization = {'hard': False, 'expression':q_ddot, 'reference':0, 'gain':1}

task_objective = {'path_constraints':[vel_regularization, acc_regularization]}
tc.add_task_constraint(task_objective)

tc.set_ocp_solver('ipopt')
tc.ocp.set_value(q0, (3.141592654/180)*[0, -60, 60, -90, -90, 0])
tc.ocp.set_value(q_dot0, [0]*robot.ndof)
disc_settings = {'discretization method': 'multiple shooting', 'horizon size': horizon_size, 'order':1, 'integration':'rk'}
tc.set_discretization_settings(disc_settings)
sol = tc.solve_ocp()
"""

  # ----------------------------------------------------------------------

  def code_setup(self, state):
    ocp_string = """
T_init = 1.5 # [hide]
ocp = Ocp(T = FreeTime(1.5)) # [hide]

distance = lambda a,b : sqrt(sumsqr(a-b)) # [hide]

state = ocp.state     # [hide]
control = ocp.control # [hide]
set_der = ocp.set_der # [hide]
subject_to = ocp.subject_to # [hide]
at_t0 = ocp.at_t0 # [hide]
at_tf = ocp.at_tf # [hide]
add_objective = ocp.add_objective # [hide]
T = ocp.T # [hide]
integral = ocp.integral # [hide]
method = ocp.method # [hide]
solver = ocp.solver # [hide]

def der(expr,order=1,ocp=ocp):# [hide]
  if order==3:                 # [hide]
    return ocp.der(ocp.der(ocp.der(expr)))  # [hide]
  if order==2:                 # [hide]
    return ocp.der(ocp.der(expr))  # [hide]
  else:                       # [hide]
    return ocp.der(expr)      # [hide]

g = 9.8 # [hide]
α_lim = ocp.parameter() #in radians [hide]

# Model of system dynamics
h = state() # Hoist length   [m]
x = state() # Cart position  [m]
α = state() # Pendulum angle [rad]
"""

    if state["problemMode"].startswith("naive"):
      ocp_string += """      
x_T = ocp.variable()
x_max = ocp.variable()

subject_to(0<= (x_T <= ocp.T))
subject_to(-10 <= (x_max<= 10))

h_T = ocp.variable()
h_max = ocp.variable()

subject_to(0<= (h_T <= ocp.T))
subject_to(-1 <= (h_max<= 1))

def pulse(t,T,height):
  return soft_if_else(t,T,height,0)

set_der(x,2, pulse(ocp.t,x_T,x_max) )
set_der(h,2, pulse(ocp.t,h_T,h_max) )
"""
      if state["problemMode"]=="naive_slow":
        ocp_string += """
slowdown = 4
subject_to(  -0.4/slowdown <= (der(x)   <= 0.4/slowdown  ))
subject_to( -0.25/slowdown <= (der(h)   <= 0.25/slowdown ))
"""

    else:
      ocp_string += """set_der(x,2, control(order=1)           )
set_der(h,2, control(order=1)           )
"""
    ocp_string+="""set_der(α,2, 1/h*( -der(x,2)*cos(α) - \\
             2*der(h)*der(α) -g*sin(α)) )

# Payload position vector
p = vertcat(x + h*sin(α), -h*cos(α))

x_0 = ocp.parameter()
h_0 = ocp.parameter()
x_f = ocp.parameter() #final desired position of the cart
h_f = ocp.parameter() #final desired length of the pendulum

A = ocp.parameter(2)
B = ocp.parameter(2)
rC = ocp.parameter(2)
rD = ocp.parameter(2)

# Initial constraints
subject_to(        at_t0(     p   ) == A)
subject_to(        at_t0(     α   ) == 0)
for s in [h,x,α]:
  subject_to(      at_t0( der(s)  ) == 0)

# Final constraints
subject_to(        at_tf(     p   ) == B)
"""
    
    if state["NoSwing"] and 'naive' not in state["problemMode"]:
      ocp_string += """subject_to(        at_tf(     α   ) == 0)
for s in [h,x,α]:
  subject_to(      at_tf( der(s)  ) == 0)
for s in [h,x]: # [hide] der(α,2) implied by other constraints
  subject_to(      at_tf( der(s,2)) == 0) # [hide]
subject_to(        at_tf( der(h,3)) == 0) # [hide]
subject_to(        at_tf( der(x,3)) == 0) # [hide]
"""
    if state["problemMode"]=='optimal':
      ocp_string += """
# Path constraints
subject_to = lambda expr,ocp=ocp: ocp.subject_to(expr,grid='inf') # [hide]
"""
    ocp_string += """subject_to(     0 <= (    x    <= 0.5  ))
subject_to(   0.4 <= (    h    <= 1.1  ))
subject_to(  -0.4 <= (der(x)   <= 0.4  ))
subject_to( -0.25 <= (der(h)   <= 0.25 ))
subject_to(   -10 <= (der(x,2) <= 10   ))
subject_to(    -1 <= (der(h,2) <= 1    ))
"""
    if state["problemMode"]=="optimal":
      ocp_string += """
subject_to(  -100 <= (der(x,3) <= 100   )) # [hide]
subject_to(   -10 <= (der(h,3) <= 10    )) # [hide]
"""

    ocp_string += """
subject_to(-α_lim <= (    α    <= α_lim)) # [hide]
"""
    if state["problemMode"]=='optimal':
      ocp_string += """
subject_to = ocp.subject_to # [hide]
"""
    ocp_string += """
tau = ocp.t/T # [hide]
"""
   
    if state["problemMode"]=="optimal" and state["ObstacleAvoidance"]:
        ocp_string += """
C = ocp.parameter(2)
R = ocp.parameter(1)

# Keep distance from obstacle center
#subject_to(distance(p,C)**2>=R**2,grid='integrator') # [hide]

ax = ocp.control(order=1)# [hide]
ay = ocp.control(order=1)# [hide]
b  = ocp.control(order=1)# [hide]

points = [# [hide]
  [C[0]-R,C[1]-10],# [hide]
  [C[0]-R,C[1]],# [hide]
  [C[0]+R,C[1]],# [hide]
  [C[0]+R,C[1]-10]]# [hide]

ocp.subject_to(ax*p[0]+ay*p[1]>=b+0.001,grid='integrator')# [hide]

for v in points:# [hide]
  ocp.subject_to(ax*v[0]+ay*v[1]<=b,grid='integrator')# [hide]

ocp.subject_to(-1<=(ax<=1))# [hide]
ocp.subject_to(-1<=(ay<=1))# [hide]
"""

    if state["problemMode"]=="optimal" and state['trackingMode']!='none':
      ocp_string += """
N = 4 # [hide]

points_x = MX.sym("x",N) # [hide]
points_y = MX.sym("y",N) # [hide]

s = DM(np.linspace(0,1,N)) # [hide]

coeffs_x = solve(horzcat(s**3,s**2,s**1,s**0),points_x,"symbolicqr") # [hide]
coeffs_y = solve(horzcat(s**3,s**2,s**1,s**0),points_y,"symbolicqr") # [hide]

s = MX.sym("s") # [hide]
f = Function('f',[s,points_x,points_y],[vertcat(dot(coeffs_x,vertcat(s**3,s**2,s**1,1)),dot(coeffs_y,vertcat(s**3,s**2,s**1,1)))]) # [hide]

points_x = vertcat(A[0],rC[0],rD[0],B[0]) # [hide]
points_y = vertcat(A[1],rC[1],rD[1],B[1]) # [hide]

reference_path = lambda s,f=f,points_x=points_x,points_y=points_y: f(s,points_x,points_y) # [hide]

s = control(order=1) # Path coordinate
subject_to(0 <= (s <= 1))
ocp.set_initial(s, 0*(1-tau)+tau*1) # [hide]
subject_to(  der(s)>=0  ) # [hide]
"""

    if state["problemMode"]=="optimal" and state['trackingMode']=='constraint':
      ocp_string += """
r = ocp.parameter()

err = distance(p,reference_path(s)) 
subject_to(err**2<=r**2,grid='integrator')
    """

    if state["problemMode"]=="optimal" and state['trackingMode']=='objective':
      ocp_string += """
w = ocp.parameter()

err = distance(p,reference_path(s))
add_objective( w*integral(err**2) )"""

    ocp_string += """
add_objective(T) # Time-optimal

# [hide] Very tiny regulariation to avoid the hoist going up and down ad libitem while waiting for the cart
dx = der(x) # [hide]
dh = der(h) # [hide]
#add_objective(1e-5*ocp.integral(der(dh)**2)+1e-6*ocp.integral(der(dx)**2)) # [hide]
"""

    ocp_string += """
method(MultipleShooting(N=20,M=2,intg='rk'))
opts = {"expand":True, 'ipopt':{"max_iter": 2000, 'hessian_approximation':'exact', 'max_cpu_time': 5, 'limited_memory_max_history' : 5, 'print_level':5}} # [hide]
solver("ipopt", opts)

# [skipafter]
    """

    if state["problemMode"]=="optimal" and state["ObstacleAvoidance"]:
      ocp_string += """
ocp.set_value(C, 0)
ocp.set_value(R, 0)"""

    if state["problemMode"]=="optimal" and state['trackingMode']=='constraint':
      ocp_string += """
ocp.set_value(r, 0)
"""
    if state["problemMode"]=="optimal" and state['trackingMode']=='objective':
      ocp_string += """
ocp.set_value(w, 0)
"""
    ocp_string+= """
ocp.set_value(A, 0)
ocp.set_value(B, 0)
ocp.set_value(rC, 0)
ocp.set_value(rD, 0)

ocp.set_value(x_0, 0)
ocp.set_value(x_f, 0)
ocp.set_value(h_0, 0)
ocp.set_value(h_f, 0)

ocp.set_value(α_lim, 0)
        """

    ocp_string += """

outputs = OrderedDict()

t_vec = np.arange(0,5,0.01);

outputs["time"] = t_vec

expr = vertcat(x, dx, h, dh, α)


def sample_at(ocp,expr,grid): # [hide]
  return ocp.sampler('temp', expr).map(len(grid),[True,False],[False])(ocp.gist,grid) # [hide]

res = sample_at(ocp, expr, t_vec)

outputs["x"] = res[0,:]#sample_at(ocp, x, t_vec)
outputs["x_dot"] = res[1,:]#sample_at(ocp, x_dot, t_vec)
outputs["h"] = res[2,:]#sample_at(ocp, h, t_vec)
outputs["h_dot"] = res[3,:]#sample_at(ocp, h_dot, t_vec)
##Next outputs are not needed by the simulink crane controller
outputs["alpha"] = res[4,:]#sample_at(ocp, α, t_vec)
outputs["T"] = ocp.value(ocp.T)
"""
    if state["problemMode"]=="optimal" and state['trackingMode']!='none':
      ocp_string += """
outputs['t_ocp'], outputs["reference"] = ocp.sample(reference_path(tau),grid='integrator',refine=100)
outputs["reference"] = outputs["reference"].T
"""

    ocp_string+= """
outputs["traj"] = ocp.sample(p,grid=f'integrator',refine=100)[1].T
outputs["trajcart"] = ocp.sample(vertcat(x,0),grid='integrator',refine=100)[1].T
"""
    ocp_string+= """
inputs = OrderedDict()
"""
    if state["problemMode"]=="optimal" and state["ObstacleAvoidance"]:
      ocp_string += """
inputs["C"] = C
inputs["R"] = R"""

    if state["problemMode"]=="optimal" and state['trackingMode']=='constraint':
      ocp_string += """
inputs["r"] = r
"""
    if state["problemMode"]=="optimal" and state['trackingMode']=='objective':
      ocp_string += """
inputs["w"] = w
"""
    ocp_string += """
inputs["A"] = A
inputs["B"] = B
inputs["rC"] = rC
inputs["rD"] = rD
inputs["x_0"] = x_0
inputs["x_f"] = x_f
inputs["h_0"] = h_0
inputs["h_f"] = h_f
inputs["alpha_lim"] = α_lim

inputs["T_init"] = ocp.value(ocp.T)
inputs["x_init"] = ocp.sample(x,grid='control')[1]
inputs["x_dot_init"] = ocp.sample(dx,grid='control')[1]
inputs["h_init"] = ocp.sample(h,grid='control')[1]
inputs["h_dot_init"] = ocp.sample(dh,grid='control')[1]
#inputs["u_init"] = ocp.sample(ocp.u,grid='control-')[1]

solver = ocp.to_function('solver',inputs.values(),outputs.values(),inputs.keys(),outputs.keys())

def get_call(f):
  for k in range(f.n_instructions()):
    if f.instruction_id(k)==OP_CALL:
      e = f.instruction_MX(k)
      return e.which_function()

solver_obj = get_call(solver)
"""

    return ocp_string


  def code_set_value(self, state):
    s = """
values = dict()
"""
    if state["problemMode"]=="optimal" and state['trackingMode']=='constraint':
      s += """
values["r"] = {TunnelRadius}
""".format(TunnelRadius=state['tunnel']["radius"])

    if state["problemMode"]=="optimal" and state['trackingMode']=='objective':
      s += """
values["w"] = {trackingWeight}
""".format(trackingWeight=state['trackingWeight'])

    s += """
values["A"] = {A}
values["B"] = {B}
values["rC"] = {C}
values["rD"] = {D}

x_0_num = {A}[0]
x_f_num = {B}[0]
h_0_num = -{A}[1]
h_f_num = -{B}[1]

values["x_0"] = x_0_num
values["x_f"] = x_f_num
values["h_0"] = h_0_num
values["h_f"] = h_f_num

values["alpha_lim"] = {maxAngle}

tau_num = linspace(0.0,1.0,21)


dx_max = 0.2
dh_max = 0.25
T_init = 1.1*max(abs(x_f_num-x_0_num)/dx_max,abs(h_f_num-h_0_num)/dh_max)

values["T_init"] = T_init
values["x_init"] = x_0_num*(1-tau_num)+tau_num*x_f_num
values["x_dot_init"] = (x_f_num-x_0_num)/T_init
values["h_init"] = h_0_num*(1-tau_num)+tau_num*h_f_num-{init}*sin(pi*tau_num)
values["h_dot_init"] = (h_f_num-h_0_num)/T_init

print(values["h_init"])
print(values["h_dot_init"])
#values["u_init"] = vertcat((1*(1-tau_num[:-1])+tau_num[:-1]*(-1)).T,(1*(1-tau_num[:-1])+tau_num[:-1]*(-1)).T)

""".format(**state)

    if state["problemMode"]=="optimal" and state["ObstacleAvoidance"]:
      s += """
values["C"] = {Obs1}
values["R"] = {ObstacleRadius}
""".format(Obs1=[state["obs1"]["x"],state["obs1"]["y"]],ObstacleRadius=state['obs1']["radius"])
    return s

  def code_postprocessing(self, state):
    postprocessing_string = """

ret = {}

for k in outputs:
  print(k)
  ret[k] = np.array(sol[k]).flatten()
  print(len(ret[k]))

max_index = min(int(ret["T"][0]*100),ret["x"].shape[0])

ret["x"][max_index:] = ret["x"][max_index-1]
ret["x_dot"][max_index:] = 0
ret["h"][max_index:] = ret["h"][max_index-1]
ret["h_dot"][max_index:] = 0


for k in outputs:
  ret[k] = ret[k].tolist()

    """

    if os.path.exists('/artifacts'):
      postprocessing_string += """
import scipy.io
scipy.io.savemat("/artifacts/sampled.mat",ret)


#The format for the casadi function to be used by simulink:
cas_fun = Function('cas_fun', [], ret.values())
cas_fun.save('/artifacts/cas_fun.casadi')
      """

    return postprocessing_string

  def code_solve(self, state):
    return """
sol = solver(**values)
"""

  def filter(self, s):
    ret = []
    s_prev = ""
    for s in s.split("\n"):
      if "[skipafter]" in s: break
      if "[hide]" in s: continue
      if "parameter" in s: continue
      if s_prev=="" and s=="": continue # Skip repeated line-breaks
      ret.append(s)
      s_prev = s
    return "\n".join(ret)

  # ------------------------------------------------------------------------------- #
  # -------------------------- Executor: Other methods ---------------------------- #
  # ------------------------------------------------------------------------------- #

  def warmstart(self):
    print("warmstarting problem formulations ... (might take a minute)")
    for NoSwing in [True, False]:
      for problemMode in ['naive', 'naive_slow','optimal']:
        for ObstacleAvoidance in [True, False]:
          for trackingMode in ["none","objective","constraints"]:
            code_setup = self.code_setup({"NoSwing": NoSwing, "problemMode": problemMode, "ObstacleAvoidance": ObstacleAvoidance, "trackingMode": trackingMode})
            context = {}
            exec(code_setup, self.globals, context)
            self.cache[code_setup] = context

    print("Done")
    

  def sense_world(self, input_json):
    # return {
    #   "hi" : "bye"
    # }
    return input_json

  def test_compute(self, ocp_settings_json):
    # Local scope of Ocp problem

    context = {}

    selected_robot = ocp_settings_json["selectedRobot"]
    robot_joint_state = ocp_settings_json["robotJointState"]
    task_settings = ocp_settings_json["taskSettings"]
    obstacle_settings = ocp_settings_json["obstacleSettings"]
    joint_position_limits = ocp_settings_json["jointPositionLimits"]
    joint_velocity_limits = ocp_settings_json["jointVelocityLimits"]
    joint_acceleration_limits = ocp_settings_json["jointAccelerationLimits"]
    joint_torque_limits = ocp_settings_json["jointTorqueLimits"]
    bin_settings1 = ocp_settings_json["binSettings1"]
    bin_settings2 = ocp_settings_json["binSettings2"]

    print(selected_robot)
    print(robot_joint_state)
    print(task_settings)
    print(obstacle_settings)
    print(joint_position_limits)
    print(joint_velocity_limits)
    print(joint_acceleration_limits)
    print(joint_torque_limits)
    print(bin_settings1)
    print(bin_settings2)

    return ocp_settings_json

  def compute(self, state):
    # Local scope of Ocp problem

    context = {}

    # Do setup
    t0 = time.time()

    code_setup = self.code_setup(state)
    code_set_value = self.code_set_value(state)
    code_solve = self.code_solve(state)
    code_postprocessing = self.code_postprocessing(state)
    code_setup_filtered = self.filter(code_setup)

    if os.path.exists('/artifacts'):
      with open('/artifacts/problem.py','w') as f:
        f.write("from rockit import *\n")
        f.write("from casadi import *\n")
        f.write("from collections import OrderedDict\n")
        f.write(code_setup)
        f.write(code_set_value)
        f.write(code_solve)
        f.write(code_postprocessing)
      with open('/artifacts/problem_simple.py','w') as f:
        f.write(code_setup_filtered)


    if code_setup in self.cache:
      print("from cache")
      context = self.cache[code_setup]
    else:
      exec(code_setup, self.globals, context)
      self.cache[code_setup] = context
    print("problem construction [s]", time.time()-t0)

    t0 = time.time()
    # Set parameter values
    exec(code_set_value, self.globals, context)
    print("overhead set_value [s]", time.time()-t0)

    t0 = time.time()
    # Solve
    exec(code_solve, self.globals, context)
    cpu_time = time.time()-t0
    print("solve [s]", cpu_time)

    stats = context["solver_obj"].stats(1)
    return_status = stats["return_status"]

    ret = {}
    ret["success"] = stats["success"]
    ret["status"] = stats["return_status"]
    ret["cpu_time"] = stats["t_wall_total"]
    ret["code"] = code_setup_filtered

    print(return_status,stats["success"])
    if not stats["success"]:
      return ret

    # Do post-processing
    t0 = time.time()
    exec(code_postprocessing, self.globals, context)
    print("overhead post-processing [s]", time.time()-t0)
  
    ret.update(context["ret"])
    self.result = ret
    return ret

  def get_result_dictionary(self):
    return self.result
