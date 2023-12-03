FROM python:3.8

WORKDIR /app

ADD . /app

RUN pip install mysql-connector-python requests schedule 

CMD ["python3", "fetchWeather.py"]
