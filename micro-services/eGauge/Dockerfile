FROM python:3.8

WORKDIR /app

ADD . /app

RUN pip install mysql-connector-python egauge-python

CMD ["python3", "egauge_API_db.py"]

