@ECHO OFF
SETLOCAL

FOR %%a IN (HKCU HKLM) DO (
FOR %%b IN (360Chrome 360se6 "Google Chrome") DO (
FOR /f "usebackq tokens=2,* skip=2" %%i IN (
    `REG QUERY "%%a\Software\Clients\StartMenuInternet\%%~b\shell\open\command" /ve 2^>nul`
) DO SET BUILDER=%%j))

IF NOT DEFINED BUILDER (
    ECHO Install a Google Chrome or 360 Browser first please.
    EXIT /b 1001
)

SET EXT_PATH=%~1
SET CRX_FILE_NEW=%~2

SET CRX_FILE=%EXT_PATH%.crx
SET PEM_FILE=%EXT_PATH%.pem

DEL /q "%CRX_FILE%" 1>nul 2>nul
DEL /q "%PEM_FILE%" 1>nul 2>nul

%BUILDER% --pack-extension="%EXT_PATH%"

IF %ERRORLEVEL% NEQ 0 (
    ECHO Packaging went wrong. %ERRORLEVEL%
    EXIT /b %ERRORLEVEL%
)

DEL /q "%PEM_FILE%" 1>nul 2>nul
IF DEFINED CRX_FILE_NEW MOVE /y "%CRX_FILE%" "%CRX_FILE_NEW%" 1>nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO File copying failed. %ERRORLEVEL%
    EXIT /b 1002
)

ECHO Done!
