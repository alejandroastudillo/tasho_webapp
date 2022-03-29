FROM ubuntu:focal
RUN apt update
RUN apt install -y wget xz-utils curl gnupg
RUN wget https://nodejs.org/dist/v12.19.0/node-v12.19.0-linux-x64.tar.xz -O /tmp/node.tar.xz
RUN cd /usr && tar --strip-components 1 -xf /tmp/node.tar.xz
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update
RUN apt install --no-install-recommends --yes yarn git
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
RUN chmod +x miniconda.sh && ./miniconda.sh -b
ENV PATH="/root/miniconda3/bin:$PATH"
SHELL ["/bin/bash", "-c"]
RUN /root/miniconda3/bin/activate
RUN pip install git+https://gitlab.kuleuven.be/meco-software/rockit.git@demo cherrypy
RUN mkdir -p /local/front-end
WORKDIR /local/front-end
COPY front-end/*.json /local/front-end/
COPY front-end/public /local/front-end/public
COPY front-end/src /local/front-end/src
RUN npm install; npm audit fix
RUN yarn build
RUN yarn global add serve
EXPOSE 8080
EXPOSE 9090/udp
COPY server.py /local/
WORKDIR /local
CMD ["python","server.py"]
