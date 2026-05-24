@echo off
setlocal

set "BASE_DIR=%~dp0"
set "PROJECT_DIR=%BASE_DIR:~0,-1%"
set "WRAPPER_JAR=%BASE_DIR%.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
    echo Maven Wrapper jar not found: %WRAPPER_JAR%
    exit /b 1
)

java -Dmaven.multiModuleProjectDirectory="%PROJECT_DIR%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
