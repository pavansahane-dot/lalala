@echo off
REM Azure CLI Wrapper - Use this until PATH is fixed

set AZURE_CLI="C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

if "%1"=="" (
    echo Usage: az-cli.bat [command]
    echo Example: az-cli.bat login
    echo Example: az-cli.bat --version
    exit /b 1
)

%AZURE_CLI% %*
