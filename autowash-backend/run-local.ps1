# Run AutoWash backend locally (recompiles sources, then starts on :8080).
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$work = Join-Path $here "target\rebuild-work"
$jar = Join-Path $here "target\autowash-backend-0.0.1-SNAPSHOT.jar"
$config = Join-Path $here "src\main\resources\application-local.properties"

if (-not (Test-Path $jar)) {
  throw "Missing $jar. Build the backend with Maven first: mvn clean package -DskipTests"
}

New-Item -ItemType Directory -Force -Path $work | Out-Null
Set-Location $work
if (-not (Test-Path "BOOT-INF\classes")) {
  jar xf $jar BOOT-INF/classes BOOT-INF/lib META-INF/MANIFEST.MF
}

$cp = "BOOT-INF/classes;" + ((Get-ChildItem BOOT-INF/lib/*.jar | ForEach-Object { $_.FullName }) -join ";")
$lines = Get-ChildItem "$here\src\main\java" -Recurse -Filter *.java | ForEach-Object { $_.FullName }
[System.IO.File]::WriteAllLines("$work\sources.txt", $lines)
javac -encoding UTF-8 -parameters -cp $cp -d BOOT-INF/classes "@sources.txt"

Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

Write-Host "Starting backend on http://localhost:8080 ..."
java -cp $cp com.autowash.AutowashBackendApplication `
  --spring.profiles.active=local `
  --spring.config.additional-location="file:$config"
