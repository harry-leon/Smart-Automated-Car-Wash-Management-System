# Run AutoWash backend locally on :8080.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $here ".env"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
      return
    }
    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -lt 1) {
      return
    }
    $name = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()
    Set-Item -Path "Env:$name" -Value $value
  }
}

Set-Location $here

$isJava21 = $false
if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
  if ($env:JAVA_HOME -like "*jdk-21*" -or $env:JAVA_HOME -like "*jdk21*" -or $env:JAVA_HOME -like "*21*") {
    $isJava21 = $true
  }
}

if (-not $isJava21) {
  $jdkCandidates = @(
    "C:\Program Files\Java\jdk-21",
    "C:\Program Files\Eclipse Adoptium\jdk-21*",
    "C:\Users\Thu Nguyen\.jdks\*21*"
  )

  foreach ($candidate in $jdkCandidates) {
    $resolved = Get-ChildItem $candidate -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($resolved -and (Test-Path (Join-Path $resolved.FullName "bin\java.exe"))) {
      $env:JAVA_HOME = $resolved.FullName
      break
    }
    if ((Test-Path $candidate) -and (Test-Path (Join-Path $candidate "bin\java.exe"))) {
      $env:JAVA_HOME = $candidate
      break
    }
  }
}

$mavenCommand = "mvn"
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
  $mavenCandidates = @(
    "C:\Users\Thu Nguyen\.m2\wrapper\dists\apache-maven-3.9.12-bin\5nmfsn99br87k5d4ajlekdq10k\apache-maven-3.9.12\bin\mvn.cmd",
    "C:\Users\Thu Nguyen\.m2\wrapper\dists\apache-maven-3.9.12\59fe215c0ad6947fea90184bf7add084544567b927287592651fda3782e0e798\bin\mvn.cmd",
    "C:\Users\Thu Nguyen\.m2\wrapper\dists\apache-maven-3.9.6-bin\439sdfsg2nbdob9ciift5h5nse\apache-maven-3.9.6\bin\mvn.cmd"
  )
  $resolvedMaven = $mavenCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($resolvedMaven) {
    $mavenCommand = $resolvedMaven
  }
}

if (-not $env:JAVA_HOME) {
  throw "JDK 21 was not found. Set JAVA_HOME before running this script."
}

$env:Path = "$($env:JAVA_HOME)\bin;$env:Path"

Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

Write-Host "Starting backend on http://localhost:8080 ..."
cmd /c "`"$mavenCommand`" -Dspring-boot.run.profiles=local spring-boot:run"
