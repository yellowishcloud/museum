$ErrorActionPreference = "Stop"

$port = 4173
$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

foreach ($connection in $connections) {
  $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
  if ($process -and $process.ProcessName -eq "node") {
    Write-Host "Stopping existing Node server on port $port (PID $($process.Id))..."
    Stop-Process -Id $process.Id -Force
  } elseif ($process) {
    Write-Host "Port $port is used by $($process.ProcessName) (PID $($process.Id)). Stop it manually or use PORT=4174."
    exit 1
  }
}

Write-Host "Starting Musei Kasteev on http://127.0.0.1:$port"
node --no-warnings server.js
