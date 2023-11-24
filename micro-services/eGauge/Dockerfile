FROM python:3.8

WORKDIR /app

ADD . /app

# Install dependencies
RUN pip install mysql-connector-python egauge

CMD ["python", "egauge_API_db.py"]
