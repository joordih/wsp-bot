@echo off
echo Agregando reglas de firewall para VcXsrv...

REM Permitir tráfico TCP en puerto 6000 (X11)
netsh advfirewall firewall add rule name="VcXsrv X11 TCP 6000" dir=in action=allow protocol=TCP localport=6000 profile=private,public

REM Permitir tráfico UDP en puerto 6000 (a veces se usa UDP también)
netsh advfirewall firewall add rule name="VcXsrv X11 UDP 6000" dir=in action=allow protocol=UDP localport=6000 profile=private,public

REM Permitir la aplicación VcXsrv (asegúrate de cambiar la ruta si es distinta)
netsh advfirewall firewall add rule name="VcXsrv" dir=in action=allow program="C:\Users\jordi.macho\Downloads\GWSL-Source-145\GWSL-Source-145\VCXSRV\GWSL_vcxsrv.exe" enable=yes profile=private,public

echo Reglas agregadas correctamente.
pause
