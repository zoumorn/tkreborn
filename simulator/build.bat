@echo off
cd ../../simulator-build
rem /t:Rebuild
"C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe" simulator_project.sln /p:Configuration=Release
cd ../tkreborn/simulator
set sim="../../simulator-build/Release/sim.exe"
pause
