Set-Location 'C:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner'
Write-Output "launcher-started"
$nodeOut = 'C:\Users\hp\Desktop\buildplan\site-node.out.log'
$nodeErr = 'C:\Users\hp\Desktop\buildplan\site-node.err.log'
if (Test-Path $nodeOut) { Remove-Item $nodeOut }
if (Test-Path $nodeErr) { Remove-Item $nodeErr }
$node = Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList 'C:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner\vite.runner.mjs','dev' -WorkingDirectory 'C:\Users\hp\Desktop\buildplan\buildplan-frontend\artifacts\build-planner' -RedirectStandardOutput $nodeOut -RedirectStandardError $nodeErr -PassThru
Write-Output ("node-pid=" + $node.Id)
Wait-Process -Id $node.Id
