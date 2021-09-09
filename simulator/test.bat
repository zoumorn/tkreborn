@echo off
set sim="../../simulator-build/Release/sim.exe"
set hwnd=1576956
set delay=50

%sim% SENDKEYS %hwnd% %delay% "AAbbCCddXyz`567890-=~!@#*()_+,./;'[]\<>?:{}| {RETURN}"
echo %errorlevel%=46

%sim% SENDKEYS %hwnd% %delay% "delay1000:{1000}delay1000:{1000}return:{RETURN}"
echo %errorlevel%=30

%sim% SENDKEYS %hwnd% %delay% "CTRL+V:{^v}{RETURN}"
echo %errorlevel%=9

%sim% SENDKEYS %hwnd% %delay% "SHIFT+a:{+a}{1000}|SHIFT+A:{+A}{RETURN}"
echo %errorlevel%=21

%sim% SENDKEYS %hwnd% %delay% "ALT+F4:{!F4}{1000}{ESCAPE}ESCAPED!{RETURN}{SNAPSHOT}"
echo %errorlevel%=20
