FROM python:3.8

WORKDIR /app

ADD . /app

RUN pip install python-dateutil mysql-connector-python requests

CMD ["python3", "powerview_generation.py", "ppridge1@yahoo.com", "CSE115D2024", "true"]

