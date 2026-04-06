# Targeted fix: replace specific problematic `color: 'white'` instances and remaining dark backgrounds
$srcDir = "d:\Major\TrustHut\trusthut_frontend\src"

# --- RouteOptimizer.jsx ---
$f = "$srcDir\pages\RouteOptimizer.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("background: 'rgba(6,11,20,0.97)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap',", "background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap',")
$c = $c.Replace("background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'white', outline: 'none'", "background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none'")
$c = $c.Replace("<span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{route.summary}</span>", "<span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{route.summary}</span>")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: RouteOptimizer.jsx"

# --- PostDetail.jsx ---
$f = "$srcDir\pages\PostDetail.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("color: 'white', fontSize: '15px', fontWeight: 700,", "color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700,")
$c = $c.Replace("fontSize: '14px', fontWeight: 600, color: 'white' }}>", "fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>")
$c = $c.Replace("fontSize: '20px', fontWeight: 800, color: 'white',", "fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)',")
$c = $c.Replace("fontSize: '16px', fontWeight: 700, color: 'white',", "fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)',")
$c = $c.Replace("border: '1px solid var(--border)', color: 'white', outline: 'none',", "border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none',")
$c = $c.Replace("color: 'white', fontSize: '14px', fontWeight: 700,", "color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700,")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: PostDetail.jsx"

# --- Profile.jsx ---
$f = "$srcDir\pages\Profile.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("color: 'white', fontSize: '28px', fontWeight: 800,", "color: 'var(--text-primary)', fontSize: '28px', fontWeight: 800,")
$c = $c.Replace("fontSize: '22px', fontWeight: 800, color: 'white'", "fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)'")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: Profile.jsx"

# --- Map.jsx ---
$f = "$srcDir\pages\Map.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("fontSize: '14px', fontWeight: 700, color: 'white' }}>Report Details", "fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Report Details")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: Map.jsx"

# --- PostCard.jsx ---
$f = "$srcDir\components\PostCard.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("color: 'white', fontSize: '13px', fontWeight: 700,", "color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700,")
$c = $c.Replace("border: '1px solid var(--border)', color: 'white', outline: 'none',", "border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none',")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: PostCard.jsx"

# --- EditPostModal.jsx ---
$f = "$srcDir\components\EditPostModal.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("fontSize: '15px', fontWeight: 700, color: 'white' }}>Edit Report", "fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Report")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: EditPostModal.jsx"

# --- CreatePost.jsx ---
$f = "$srcDir\components\CreatePost.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("padding: '9px 12px', color: 'white', fontSize: '13px',", "padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px',")
$c = $c.Replace("fontSize: '16px', fontWeight: 700, color: 'white' }}>New Accessibility Report", "fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>New Accessibility Report")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: CreatePost.jsx"

# --- Admin.jsx ---
$f = "$srcDir\pages\Admin.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("fontSize: '24px', fontWeight: 800, color: 'white'", "fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)'")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: Admin.jsx"

# --- Login.jsx (Forgot Password modal) ---
$f = "$srcDir\pages\Login.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("fontSize: '16px', fontWeight: 700, color: 'white' }}>", "fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: Login.jsx"

# --- ChatWindow.jsx (TrustHut -> SafeSteps) ---
$f = "$srcDir\components\chatbot\ChatWindow.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("TrustHut Assistant", "SafeSteps Assistant")
$c = $c.Replace("fontSize: '13px', fontWeight: 700, color: 'white'", "fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)'")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: ChatWindow.jsx"

# --- Chatbot.jsx ---
$f = "$srcDir\pages\Chatbot.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("background: 'rgba(6,11,20,0.5)',", "background: 'rgba(0,0,0,0.4)',")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: Chatbot.jsx"

# --- Register.jsx branding ---
$f = "$srcDir\pages\Register.jsx"
$c = [IO.File]::ReadAllText($f)
$c = $c.Replace("TrustHut", "SafeSteps")
[IO.File]::WriteAllText($f, $c)
Write-Host "Updated: Register.jsx"

Write-Host "`nAll targeted fixes applied!"
