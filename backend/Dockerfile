FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/*.jar app.jar

RUN mkdir -p /app/uploads/creativos /app/logs

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]
