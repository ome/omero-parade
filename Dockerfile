FROM centos:centos7
COPY . /src
WORKDIR /src
RUN bash /src/.omeroci/app-deps || echo oops
RUN yum install -y python-setuptools python-virtualenv
RUN virtualenv v && v/bin/pip install twine
RUN python setup.py sdist
