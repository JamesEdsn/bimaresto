$loginResp = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/api/login' `
  -ContentType 'application/json' `
  -Body '{"full_name":"John Admin","password":"admin123"}' `
  -UseBasicParsing

$token = $loginResp.data.access_token
Write-Host "Token obtained"

$headers = @{ Authorization = "Bearer $token" }
$reportResp = Invoke-RestMethod -Method Get -Uri 'http://localhost:3001/api/reports/daily?days=30' -Headers $headers -UseBasicParsing

Write-Host "=== Reports API Response ===" 
Write-Host "Total rows: $($reportResp.data.Count)"
Write-Host ""
Write-Host "All dates:"
$reportResp.data | ForEach-Object {
    Write-Host "  $($_.date): $($_.total_orders) orders, Rp $($_.total_revenue) revenue"
}

$juneData = $reportResp.data | Where-Object { $_.date -like '2026-06*' }
if ($juneData) {
    Write-Host ""
    Write-Host "✅ SUCCESS: June 2026 data found!"
    Write-Host "  Date: $($juneData.date)"
    Write-Host "  Total Orders: $($juneData.total_orders)"
    Write-Host "  Total Revenue: Rp $($juneData.total_revenue)"
} else {
    Write-Host ""
    Write-Host "❌ No June 2026 data found"
}
