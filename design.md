
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
.app { font-family: -apple-system, 'Inter', sans-serif; background: #F5F7FF; min-height: 660px; display: flex; flex-direction: column; border-radius: 20px; overflow: hidden; border: 1px solid #E8EAFF; position: relative; }
.screen { display: none; flex-direction: column; flex: 1; overflow: hidden; }
.screen.active { display: flex; }
.scroll { flex: 1; overflow-y: auto; padding: 0 14px 90px; }

.topbar { padding: 16px 16px 12px; background: #fff; border-bottom: 1px solid #F0F1FF; flex-shrink: 0; }
.topbar-row { display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 20px; font-weight: 700; color: #1A1D3B; letter-spacing: -0.3px; }
.page-sub { font-size: 12px; color: #9095B8; margin-top: 2px; }
.avatar-sm { width: 36px; height: 36px; border-radius: 50%; background: #EEF0FF; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #4C52D9; flex-shrink: 0; }

.section-label { font-size: 11px; font-weight: 700; color: #9095B8; letter-spacing: 0.8px; text-transform: uppercase; margin: 18px 0 8px; }

.balance-cards { display: flex; gap: 10px; margin: 14px 0; }
.bal-card { flex: 1; border-radius: 14px; padding: 14px 13px; }
.bal-card.receive { background: #EDFAF4; border: 1px solid #C6F0DC; }
.bal-card.owe { background: #FFF2F2; border: 1px solid #FFD9D9; }
.bal-label { font-size: 11px; font-weight: 600; color: #6B7280; margin-bottom: 6px; }
.bal-val { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; }
.bal-card.receive .bal-val { color: #0E9E5F; }
.bal-card.owe .bal-val { color: #E03838; }
.bal-sub { font-size: 11px; margin-top: 3px; }
.bal-card.receive .bal-sub { color: #3BAF7A; }
.bal-card.owe .bal-sub { color: #E87070; }

.quick-row { display: flex; gap: 8px; margin-bottom: 4px; }
.q-btn { flex: 1; background: #fff; border: 1px solid #ECEEFF; border-radius: 12px; padding: 11px 6px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
.q-btn:hover { background: #F8F9FF; border-color: #C0C4FF; }
.q-btn i { font-size: 20px; color: #4C52D9; }
.q-btn span { font-size: 11px; color: #5E637A; font-weight: 600; }

.exp-card { background: #fff; border-radius: 14px; border: 1px solid #ECEEFF; padding: 13px 14px; margin-bottom: 9px; cursor: pointer; transition: border-color 0.15s; }
.exp-card:hover { border-color: #C0C4FF; }
.exp-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.exp-icon { width: 36px; height: 36px; border-radius: 10px; background: #EEF0FF; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.exp-text { flex: 1; padding: 0 10px; }
.exp-title { font-size: 14px; font-weight: 700; color: #1A1D3B; }
.exp-meta { font-size: 11px; color: #9095B8; margin-top: 2px; }
.exp-right { text-align: right; }
.exp-amount { font-size: 15px; font-weight: 800; color: #1A1D3B; font-variant-numeric: tabular-nums; }
.exp-share { font-size: 11px; margin-top: 2px; }

.split-bar { display: flex; height: 6px; border-radius: 100px; overflow: hidden; gap: 2px; margin-bottom: 9px; }
.split-seg { height: 100%; border-radius: 100px; transition: flex 0.4s ease; }

.ppl-foot { display: flex; align-items: center; }
.avatars { display: flex; }
.av { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; border: 1.5px solid #fff; margin-right: -5px; flex-shrink: 0; }
.foot-note { font-size: 11px; color: #9095B8; margin-left: 12px; }
.pill { padding: 3px 9px; border-radius: 100px; font-size: 10px; font-weight: 700; margin-left: auto; }
.pill-pending { background: #FFF8E8; color: #C07A00; border: 1px solid #FFE8A3; }
.pill-paid { background: #EDFAF4; color: #0E9E5F; border: 1px solid #C6F0DC; }
.pill-overdue { background: #FFF2F2; color: #E03838; border: 1px solid #FFD9D9; }

.bottom-nav { display: flex; background: #fff; border-top: 1px solid #F0F1FF; padding: 6px 0 10px; flex-shrink: 0; }
.nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 4px 0; border: none; background: none; color: #BABDD8; font-size: 10px; font-weight: 600; transition: color 0.15s; font-family: inherit; }
.nav-item.active { color: #4C52D9; }
.nav-dot { width: 4px; height: 4px; border-radius: 50%; background: #4C52D9; margin: 0 auto -6px; opacity: 0; }
.nav-item.active .nav-dot { opacity: 1; }

.back-btn { background: #F5F7FF; border: 1px solid #ECEEFF; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #4C52D9; cursor: pointer; font-family: inherit; }

.field-label { font-size: 11px; font-weight: 700; color: #9095B8; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
.field-input { width: 100%; background: #F8F9FF; border: 1px solid #ECEEFF; border-radius: 10px; padding: 10px 13px; font-size: 14px; color: #1A1D3B; outline: none; font-family: inherit; transition: border-color 0.15s; }
.field-input:focus { border-color: #4C52D9; background: #fff; }
.field-group { margin-bottom: 14px; }
.amount-wrap { background: #F0F2FF; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 18px; }
.amount-big { font-size: 36px; font-weight: 800; color: #4C52D9; font-variant-numeric: tabular-nums; letter-spacing: -1.5px; }
.amount-hint { font-size: 12px; color: #9095B8; margin-top: 4px; }

.method-row { display: flex; gap: 6px; }
.method-btn { flex: 1; padding: 8px 4px; border-radius: 10px; border: 1px solid #ECEEFF; background: #F8F9FF; font-size: 12px; font-weight: 700; color: #9095B8; cursor: pointer; text-align: center; font-family: inherit; transition: all 0.15s; }
.method-btn.active { background: #EEF0FF; border-color: #B0B4FF; color: #4C52D9; }

.p-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F8F9FF; border-radius: 10px; border: 1px solid #ECEEFF; margin-bottom: 6px; transition: all 0.3s; }
.p-row.new-added { background: #EDFAF4; border-color: #C6F0DC; animation: popIn 0.35s ease; }
.p-av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.p-name { font-size: 13px; font-weight: 600; color: #1A1D3B; flex: 1; }
.p-sub { font-size: 11px; color: #9095B8; }
.p-amt { font-size: 15px; font-weight: 800; color: #4C52D9; font-variant-numeric: tabular-nums; min-width: 54px; text-align: right; }
.p-remove { background: none; border: none; cursor: pointer; color: #BABDD8; padding: 2px; display: flex; align-items: center; transition: color 0.15s; }
.p-remove:hover { color: #E03838; }

.cta { width: calc(100% - 28px); position: absolute; bottom: 72px; left: 14px; background: #4C52D9; color: #fff; border: none; border-radius: 14px; padding: 15px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; letter-spacing: 0.1px; transition: opacity 0.15s; }
.cta:active { opacity: 0.9; }

.hero-amt-section { background: #F0F2FF; border-radius: 16px; padding: 20px; margin: 14px 0; border: 1px solid #E0E2FF; text-align: center; }
.hero-label { font-size: 12px; font-weight: 600; color: #9095B8; margin-bottom: 6px; }
.hero-amt { font-size: 36px; font-weight: 800; color: #4C52D9; font-variant-numeric: tabular-nums; letter-spacing: -1.5px; }
.hero-sub { font-size: 12px; color: #9095B8; margin-top: 5px; }

.detail-card { background: #fff; border-radius: 14px; border: 1px solid #ECEEFF; overflow: hidden; margin-bottom: 10px; }
.d-row { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-bottom: 1px solid #F5F6FF; }
.d-row:last-child { border-bottom: none; }
.d-name { flex: 1; }
.d-name-main { font-size: 13px; font-weight: 600; color: #1A1D3B; }
.d-name-sub { font-size: 11px; color: #9095B8; margin-top: 1px; }
.d-amt { font-size: 14px; font-weight: 800; color: #1A1D3B; font-variant-numeric: tabular-nums; margin-right: 8px; }

.friend-card { background: #fff; border-radius: 14px; border: 1px solid #ECEEFF; padding: 12px 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.f-main { flex: 1; }
.f-name { font-size: 14px; font-weight: 700; color: #1A1D3B; }
.f-shared { font-size: 11px; color: #9095B8; margin-top: 2px; }
.f-right { text-align: right; }
.f-val { font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; }
.f-tag { font-size: 10px; font-weight: 600; margin-top: 2px; }

.notif-card { background: #fff; border-radius: 14px; border: 1px solid #ECEEFF; padding: 12px 14px; margin-bottom: 8px; display: flex; gap: 10px; }
.notif-dot { width: 7px; height: 7px; border-radius: 50%; background: #4C52D9; margin-top: 5px; flex-shrink: 0; }
.notif-dot.read { background: #D8DAF0; }
.notif-body { flex: 1; }
.notif-text { font-size: 13px; color: #1A1D3B; line-height: 1.45; font-weight: 500; }
.notif-time { font-size: 11px; color: #9095B8; margin-top: 3px; }
.pay-inline { display: inline-flex; margin-top: 8px; background: #4C52D9; color: #fff; border: none; border-radius: 8px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: inherit; }

.activity-row { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F5F6FF; align-items: flex-start; }
.activity-row:last-child { border-bottom: none; }

/* Add participant modal overlay */
.overlay { position: absolute; inset: 0; background: rgba(26,29,59,0.35); display: flex; align-items: flex-end; z-index: 20; border-radius: 20px; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
.overlay.open { opacity: 1; pointer-events: all; }
.sheet { background: #fff; border-radius: 20px 20px 0 0; padding: 20px 16px 28px; width: 100%; transform: translateY(100%); transition: transform 0.25s ease; }
.overlay.open .sheet { transform: translateY(0); }
.sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: #E0E2F0; margin: 0 auto 16px; }
.sheet-title { font-size: 16px; font-weight: 700; color: #1A1D3B; margin-bottom: 14px; }
.contact-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F5F6FF; cursor: pointer; transition: background 0.1s; }
.contact-row:last-child { border-bottom: none; }
.contact-row:hover { opacity: 0.8; }
.contact-check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ECEEFF; margin-left: auto; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
.contact-check.checked { background: #4C52D9; border-color: #4C52D9; }
.add-sheet-btn { width: 100%; background: #4C52D9; color: #fff; border: none; border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 16px; font-family: inherit; }

.split-tag { display: inline-flex; align-items: center; gap: 4px; background: #EEF0FF; border-radius: 100px; padding: 3px 10px 3px 7px; font-size: 11px; font-weight: 700; color: #4C52D9; margin-bottom: 10px; }

@keyframes popIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>

<h2 class="sr-only">LifeOS — expense splitting app with add participant flow.</h2>

<div class="app">

  <!-- HOME -->
  <div class="screen active" id="screen-home">
    <div class="topbar">
      <div class="topbar-row">
        <div><div class="page-title">Hi, Arjun 👋</div><div class="page-sub">Sunday, 28 June 2026</div></div>
        <div class="avatar-sm">AK</div>
      </div>
    </div>
    <div class="scroll" style="padding-top:2px;">
      <div class="balance-cards">
        <div class="bal-card receive"><div class="bal-label">TO RECEIVE</div><div class="bal-val">₹3,450</div><div class="bal-sub">from 2 people</div></div>
        <div class="bal-card owe"><div class="bal-label">YOU OWE</div><div class="bal-val">₹300</div><div class="bal-sub">to Riya · overdue</div></div>
      </div>
      <div class="quick-row">
        <div class="q-btn" onclick="goTo('screen-create')"><i class="ti ti-plus" aria-hidden="true"></i><span>New expense</span></div>
        <div class="q-btn"><i class="ti ti-users" aria-hidden="true"></i><span>New group</span></div>
        <div class="q-btn"><i class="ti ti-user-plus" aria-hidden="true"></i><span>Add friend</span></div>
      </div>
      <div class="section-label">pending to receive</div>
      <div class="exp-card" onclick="goTo('screen-detail')">
        <div class="exp-head">
          <div class="exp-icon">🏨</div>
          <div class="exp-text"><div class="exp-title">Goa Hotel</div><div class="exp-meta">Goa Trip · 3 days ago</div></div>
          <div class="exp-right"><div class="exp-amount">₹8,400</div><div class="exp-share" style="color:#9095B8;">you paid</div></div>
        </div>
        <div class="split-bar">
          <div class="split-seg" style="flex:0.25;background:#7C6EF5;"></div>
          <div class="split-seg" style="flex:0.25;background:#34C48B;"></div>
          <div class="split-seg" style="flex:0.3;background:#F5954B;"></div>
          <div class="split-seg" style="flex:0.2;background:#EF5DA8;"></div>
        </div>
        <div class="ppl-foot">
          <div class="avatars">
            <div class="av" style="background:#EEF0FF;color:#4C52D9;">AK</div>
            <div class="av" style="background:#E8FBF3;color:#0E9E5F;">RP</div>
            <div class="av" style="background:#FEF0E5;color:#C07A00;">KM</div>
            <div class="av" style="background:#FFF0F7;color:#C2306A;">PS</div>
          </div>
          <span class="foot-note" style="margin-left:14px;">₹2,100 pending</span>
          <span class="pill pill-overdue">2 overdue</span>
        </div>
      </div>
      <div class="exp-card">
        <div class="exp-head">
          <div class="exp-icon">🍽️</div>
          <div class="exp-text"><div class="exp-title">Sunday Dinner</div><div class="exp-meta">Friends · yesterday</div></div>
          <div class="exp-right"><div class="exp-amount">₹3,200</div><div class="exp-share" style="color:#0E9E5F;">all settled</div></div>
        </div>
        <div class="split-bar">
          <div class="split-seg" style="flex:0.33;background:#7C6EF5;"></div>
          <div class="split-seg" style="flex:0.33;background:#34C48B;"></div>
          <div class="split-seg" style="flex:0.34;background:#F5954B;"></div>
        </div>
        <div class="ppl-foot">
          <div class="avatars">
            <div class="av" style="background:#EEF0FF;color:#4C52D9;">AK</div>
            <div class="av" style="background:#E8FBF3;color:#0E9E5F;">RP</div>
            <div class="av" style="background:#FEF0E5;color:#C07A00;">KM</div>
          </div>
          <span class="foot-note" style="margin-left:14px;">everyone paid back</span>
          <span class="pill pill-paid">settled</span>
        </div>
      </div>
      <div class="section-label">you owe</div>
      <div class="exp-card">
        <div class="exp-head">
          <div class="exp-icon">🚕</div>
          <div class="exp-text"><div class="exp-title">Cab to Airport</div><div class="exp-meta">Goa Trip · 5 days ago · Riya paid</div></div>
          <div class="exp-right"><div class="exp-amount" style="color:#E03838;">₹300</div><div class="exp-share" style="color:#E03838;">your share</div></div>
        </div>
        <div class="split-bar">
          <div class="split-seg" style="flex:0.25;background:#E03838;"></div>
          <div class="split-seg" style="flex:0.25;background:#7C6EF5;"></div>
          <div class="split-seg" style="flex:0.25;background:#34C48B;"></div>
          <div class="split-seg" style="flex:0.25;background:#F5954B;"></div>
        </div>
        <div class="ppl-foot">
          <div class="avatars">
            <div class="av" style="background:#FFF2F2;color:#E03838;">RJ</div>
            <div class="av" style="background:#EEF0FF;color:#4C52D9;">AK</div>
          </div>
          <span class="foot-note" style="margin-left:14px;">Riya Joshi paid</span>
          <span class="pill pill-overdue">overdue</span>
        </div>
      </div>
    </div>
    <div class="bottom-nav">
      <button class="nav-item active" onclick="navTo(this,'screen-home')"><div class="nav-dot"></div><i class="ti ti-home" aria-hidden="true"></i><span>Home</span></button>
      <button class="nav-item" onclick="navTo(this,'screen-friends')"><div class="nav-dot"></div><i class="ti ti-users" aria-hidden="true"></i><span>Friends</span></button>
      <button class="nav-item" onclick="navTo(this,'screen-notifs')"><div class="nav-dot"></div><i class="ti ti-bell" aria-hidden="true"></i><span>Alerts</span></button>
      <button class="nav-item"><div class="nav-dot"></div><i class="ti ti-user" aria-hidden="true"></i><span>Profile</span></button>
    </div>
  </div>

  <!-- CREATE EXPENSE -->
  <div class="screen" id="screen-create">
    <div class="topbar">
      <button class="back-btn" onclick="goTo('screen-home')"><i class="ti ti-arrow-left" aria-hidden="true"></i> Back</button>
      <div class="page-title" style="margin-top:6px;">New expense</div>
    </div>
    <div class="scroll" style="padding-top:4px;">
      <div class="amount-wrap">
        <div class="amount-hint">total amount</div>
        <div class="amount-big" id="display-total">₹5,000</div>
        <div class="amount-hint" id="split-summary">split equally · <span id="n-people">4</span> people · <span id="per-person">₹1,250</span> each</div>
      </div>
      <div class="field-group">
        <div class="field-label">expense title</div>
        <input class="field-input" type="text" placeholder="e.g. Dinner at Toit" />
      </div>
      <div class="field-group">
        <div class="field-label">paid by</div>
        <div class="field-input" style="display:flex;align-items:center;gap:9px;cursor:pointer;">
          <div style="width:26px;height:26px;border-radius:50%;background:#EEF0FF;color:#4C52D9;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;">AK</div>
          <span>You</span>
          <i class="ti ti-chevron-down" style="margin-left:auto;color:#9095B8;font-size:16px;" aria-hidden="true"></i>
        </div>
      </div>
      <div class="field-group">
        <div class="field-label">split method</div>
        <div class="method-row">
          <button class="method-btn active" onclick="setMethod(this,'equal')">Equal</button>
          <button class="method-btn" onclick="setMethod(this,'percent')">Percent</button>
          <button class="method-btn" onclick="setMethod(this,'custom')">Custom</button>
        </div>
      </div>
      <div class="field-group">
        <div class="field-label">split among</div>
        <div id="participants-list">
          <div class="p-row" id="pr-ak">
            <div class="p-av" style="background:#EEF0FF;color:#4C52D9;">AK</div>
            <div><div class="p-name">You</div><div class="p-sub">organiser</div></div>
            <div class="p-amt" id="a-ak">₹1,250</div>
          </div>
          <div class="p-row" id="pr-rp">
            <div class="p-av" style="background:#E8FBF3;color:#0E9E5F;">RP</div>
            <div><div class="p-name">Rahul Patel</div><div class="p-sub">+91 98765 43210</div></div>
            <div class="p-amt" id="a-rp">₹1,250</div>
            <button class="p-remove" onclick="removeParticipant('pr-rp')" aria-label="Remove Rahul"><i class="ti ti-x" style="font-size:14px;" aria-hidden="true"></i></button>
          </div>
          <div class="p-row" id="pr-km">
            <div class="p-av" style="background:#FEF0E5;color:#C07A00;">KM</div>
            <div><div class="p-name">Karan Mehta</div><div class="p-sub">+91 87654 32109</div></div>
            <div class="p-amt" id="a-km">₹1,250</div>
            <button class="p-remove" onclick="removeParticipant('pr-km')" aria-label="Remove Karan"><i class="ti ti-x" style="font-size:14px;" aria-hidden="true"></i></button>
          </div>
          <div class="p-row" id="pr-ps">
            <div class="p-av" style="background:#FFF0F7;color:#C2306A;">PS</div>
            <div><div class="p-name">Priya Sharma</div><div class="p-sub">+91 76543 21098</div></div>
            <div class="p-amt" id="a-ps">₹1,250</div>
            <button class="p-remove" onclick="removeParticipant('pr-ps')" aria-label="Remove Priya"><i class="ti ti-x" style="font-size:14px;" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="q-btn" style="width:100%;flex-direction:row;gap:8px;padding:11px 13px;justify-content:flex-start;margin-top:6px;" onclick="openSheet()">
          <i class="ti ti-user-plus" style="font-size:17px;color:#4C52D9;" aria-hidden="true"></i>
          <span style="font-size:13px;">Add participant</span>
        </div>
      </div>
    </div>
    <button class="cta" onclick="goTo('screen-review')">Review &amp; send requests →</button>
    <div style="height:72px;flex-shrink:0;"></div>

    <!-- Add participant bottom sheet -->
    <div class="overlay" id="add-overlay" onclick="handleOverlayClick(event)">
      <div class="sheet" id="add-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Add participant</div>
        <input class="field-input" type="text" placeholder="Search by name or phone" style="margin-bottom:12px;" oninput="filterContacts(this.value)" id="contact-search" />
        <div id="contact-list">
          <div class="contact-row" id="cr-rj" onclick="toggleContact('cr-rj','Riya Joshi','+91 65432 10987','RJ','#FFF2F2','#E03838')">
            <div class="p-av" style="background:#FFF2F2;color:#E03838;width:34px;height:34px;">RJ</div>
            <div><div class="p-name">Riya Joshi</div><div class="p-sub">+91 65432 10987</div></div>
            <div class="contact-check" id="chk-rj"><i class="ti ti-check" style="font-size:11px;color:#fff;display:none;" aria-hidden="true"></i></div>
          </div>
          <div class="contact-row" id="cr-as" onclick="toggleContact('cr-as','Ankit Shah','+91 54321 09876','AS','#F0F8FF','#1565C0')">
            <div class="p-av" style="background:#F0F8FF;color:#1565C0;width:34px;height:34px;">AS</div>
            <div><div class="p-name">Ankit Shah</div><div class="p-sub">+91 54321 09876</div></div>
            <div class="contact-check" id="chk-as"><i class="ti ti-check" style="font-size:11px;color:#fff;display:none;" aria-hidden="true"></i></div>
          </div>
          <div class="contact-row" id="cr-nm" onclick="toggleContact('cr-nm','Neha Mishra','+91 43210 98765','NM','#F5F0FF','#6B21A8')">
            <div class="p-av" style="background:#F5F0FF;color:#6B21A8;width:34px;height:34px;">NM</div>
            <div><div class="p-name">Neha Mishra</div><div class="p-sub">+91 43210 98765</div></div>
            <div class="contact-check" id="chk-nm"><i class="ti ti-check" style="font-size:11px;color:#fff;display:none;" aria-hidden="true"></i></div>
          </div>
          <div class="contact-row" id="cr-vs" onclick="toggleContact('cr-vs','Vikram Soni','+91 32109 87654','VS','#FFF7ED','#9A3412')">
            <div class="p-av" style="background:#FFF7ED;color:#9A3412;width:34px;height:34px;">VS</div>
            <div><div class="p-name">Vikram Soni</div><div class="p-sub">+91 32109 87654</div></div>
            <div class="contact-check" id="chk-vs"><i class="ti ti-check" style="font-size:11px;color:#fff;display:none;" aria-hidden="true"></i></div>
          </div>
        </div>
        <button class="add-sheet-btn" id="add-sheet-btn" onclick="confirmAdd()" style="opacity:0.4;pointer-events:none;">Select a contact to add</button>
      </div>
    </div>
  </div>

  <!-- EXPENSE DETAIL -->
  <div class="screen" id="screen-detail">
    <div class="topbar">
      <button class="back-btn" onclick="goTo('screen-home')"><i class="ti ti-arrow-left" aria-hidden="true"></i> Dashboard</button>
    </div>
    <div class="scroll" style="padding-top:4px;">
      <div class="hero-amt-section">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;">
          <span style="font-size:24px;">🏨</span>
          <span style="font-size:16px;font-weight:700;color:#4C52D9;">Goa Hotel</span>
        </div>
        <div class="hero-amt">₹8,400</div>
        <div class="hero-sub">Paid by you · Goa Trip · Jun 25</div>
        <div class="split-bar" style="margin:14px 0 0;height:8px;">
          <div class="split-seg" style="flex:0.25;background:#7C6EF5;"></div>
          <div class="split-seg" style="flex:0.25;background:#34C48B;"></div>
          <div class="split-seg" style="flex:0.3;background:#F5954B;"></div>
          <div class="split-seg" style="flex:0.2;background:#EF5DA8;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;">
          <span style="font-size:10px;color:#9095B8;">You</span>
          <span style="font-size:10px;color:#9095B8;">Rahul</span>
          <span style="font-size:10px;color:#9095B8;">Karan</span>
          <span style="font-size:10px;color:#9095B8;">Priya</span>
        </div>
      </div>
      <div class="section-label">who owes what</div>
      <div class="detail-card">
        <div class="d-row">
          <div class="av" style="background:#EEF0FF;color:#4C52D9;width:32px;height:32px;font-size:10px;border:none;">AK</div>
          <div class="d-name"><div class="d-name-main">You</div><div class="d-name-sub">organiser · paid</div></div>
          <div class="d-amt">₹2,100</div><span class="pill pill-paid">paid</span>
        </div>
        <div class="d-row">
          <div class="av" style="background:#E8FBF3;color:#0E9E5F;width:32px;height:32px;font-size:10px;border:none;">RP</div>
          <div class="d-name"><div class="d-name-main">Rahul Patel</div><div class="d-name-sub">paid 2h ago via UPI</div></div>
          <div class="d-amt">₹2,100</div><span class="pill pill-paid">paid</span>
        </div>
        <div class="d-row">
          <div class="av" style="background:#FEF0E5;color:#C07A00;width:32px;height:32px;font-size:10px;border:none;">KM</div>
          <div class="d-name"><div class="d-name-main">Karan Mehta</div><div class="d-name-sub">requested 3 days ago</div></div>
          <div class="d-amt">₹2,520</div><span class="pill pill-overdue">overdue</span>
        </div>
        <div class="d-row">
          <div class="av" style="background:#FFF0F7;color:#C2306A;width:32px;height:32px;font-size:10px;border:none;">PS</div>
          <div class="d-name"><div class="d-name-main">Priya Sharma</div><div class="d-name-sub">requested 3 days ago</div></div>
          <div class="d-amt">₹1,680</div><span class="pill pill-pending">pending</span>
        </div>
      </div>
      <div class="section-label">actions</div>
      <div class="quick-row">
        <div class="q-btn" onclick="sendPrompt('Send reminder to Karan and Priya for Goa Hotel expense')"><i class="ti ti-bell" aria-hidden="true"></i><span>Remind all</span></div>
        <div class="q-btn"><i class="ti ti-edit" aria-hidden="true"></i><span>Edit</span></div>
        <div class="q-btn"><i class="ti ti-share" aria-hidden="true"></i><span>Share</span></div>
      </div>
      <div class="section-label">activity</div>
      <div style="background:#fff;border-radius:14px;border:1px solid #ECEEFF;padding:0 14px;">
        <div class="activity-row">
          <div class="av" style="background:#E8FBF3;color:#0E9E5F;width:28px;height:28px;font-size:9px;border:none;flex-shrink:0;">RP</div>
          <div><div style="font-size:13px;color:#1A1D3B;font-weight:500;">Rahul paid <strong>₹2,100</strong></div><div style="font-size:11px;color:#9095B8;margin-top:1px;">Today 2:13 PM · UPI</div></div>
        </div>
        <div class="activity-row">
          <div class="av" style="background:#EEF0FF;color:#4C52D9;width:28px;height:28px;font-size:9px;border:none;flex-shrink:0;">AK</div>
          <div><div style="font-size:13px;color:#1A1D3B;font-weight:500;">Expense created · split 4 ways</div><div style="font-size:11px;color:#9095B8;margin-top:1px;">Jun 25, 8:00 PM</div></div>
        </div>
      </div>
    </div>
    <div class="bottom-nav">
      <button class="nav-item active" onclick="goTo('screen-home')"><div class="nav-dot" style="opacity:0;"></div><i class="ti ti-arrow-left" aria-hidden="true"></i><span>Back</span></button>
    </div>
  </div>

  <!-- FRIENDS -->
  <div class="screen" id="screen-friends">
    <div class="topbar">
      <div class="topbar-row">
        <div><div class="page-title">Friends</div><div class="page-sub">4 friends · ₹3,450 to receive</div></div>
        <button class="back-btn" style="margin:0;"><i class="ti ti-user-plus" aria-hidden="true"></i> Add</button>
      </div>
    </div>
    <div class="scroll" style="padding-top:4px;">
      <div class="section-label" style="margin-top:8px;">they owe you</div>
      <div class="friend-card">
        <div class="av" style="background:#FEF0E5;color:#C07A00;width:40px;height:40px;font-size:12px;border:none;flex-shrink:0;">KM</div>
        <div class="f-main"><div class="f-name">Karan Mehta</div><div class="f-shared">5 shared · Goa Hotel</div></div>
        <div class="f-right"><div class="f-val" style="color:#E03838;">₹2,520</div><div class="f-tag" style="color:#E03838;">owes you</div></div>
      </div>
      <div class="friend-card">
        <div class="av" style="background:#FFF0F7;color:#C2306A;width:40px;height:40px;font-size:12px;border:none;flex-shrink:0;">PS</div>
        <div class="f-main"><div class="f-name">Priya Sharma</div><div class="f-shared">2 shared · Goa Hotel</div></div>
        <div class="f-right"><div class="f-val" style="color:#E03838;">₹930</div><div class="f-tag" style="color:#E03838;">owes you</div></div>
      </div>
      <div class="section-label">you owe</div>
      <div class="friend-card">
        <div class="av" style="background:#FFF2F2;color:#E03838;width:40px;height:40px;font-size:12px;border:none;flex-shrink:0;">RJ</div>
        <div class="f-main"><div class="f-name">Riya Joshi</div><div class="f-shared">1 shared · Cab to Airport</div></div>
        <div class="f-right"><div class="f-val" style="color:#C07A00;">₹300</div><div class="f-tag" style="color:#C07A00;">you owe</div></div>
      </div>
      <div class="section-label">settled</div>
      <div class="friend-card">
        <div class="av" style="background:#E8FBF3;color:#0E9E5F;width:40px;height:40px;font-size:12px;border:none;flex-shrink:0;">RP</div>
        <div class="f-main"><div class="f-name">Rahul Patel</div><div class="f-shared">3 shared expenses</div></div>
        <div class="f-right"><div class="f-val" style="color:#0E9E5F;">All clear</div><div class="f-tag" style="color:#0E9E5F;">settled</div></div>
      </div>
    </div>
    <div class="bottom-nav">
      <button class="nav-item" onclick="navTo(this,'screen-home')"><div class="nav-dot"></div><i class="ti ti-home" aria-hidden="true"></i><span>Home</span></button>
      <button class="nav-item active" onclick="navTo(this,'screen-friends')"><div class="nav-dot"></div><i class="ti ti-users" aria-hidden="true"></i><span>Friends</span></button>
      <button class="nav-item" onclick="navTo(this,'screen-notifs')"><div class="nav-dot"></div><i class="ti ti-bell" aria-hidden="true"></i><span>Alerts</span></button>
      <button class="nav-item"><div class="nav-dot"></div><i class="ti ti-user" aria-hidden="true"></i><span>Profile</span></button>
    </div>
  </div>

  <!-- NOTIFICATIONS -->
  <div class="screen" id="screen-notifs">
    <div class="topbar"><div class="page-title">Notifications</div><div class="page-sub">3 unread</div></div>
    <div class="scroll" style="padding-top:4px;">
      <div class="section-label" style="margin-top:8px;">new</div>
      <div class="notif-card" style="border-color:#D6D8FF;"><div class="notif-dot"></div><div class="notif-body"><div class="notif-text">Rahul Patel paid <strong>₹2,100</strong> for Goa Hotel.</div><div class="notif-time">Today, 2:13 PM</div></div></div>
      <div class="notif-card" style="border-color:#FFD9D9;"><div class="notif-dot" style="background:#E03838;"></div><div class="notif-body"><div class="notif-text">You owe <strong>₹300</strong> to Riya Joshi for Cab to Airport. Payment overdue.</div><div class="notif-time">Today, 9:00 AM</div><button class="pay-inline" onclick="sendPrompt('Pay ₹300 to Riya Joshi via UPI')">Pay ₹300 via UPI ↗</button></div></div>
      <div class="notif-card" style="border-color:#D6D8FF;"><div class="notif-dot"></div><div class="notif-body"><div class="notif-text">Karan Mehta was added to Goa Trip.</div><div class="notif-time">Jun 23, 6:45 PM</div></div></div>
      <div class="section-label">earlier</div>
      <div class="notif-card"><div class="notif-dot read"></div><div class="notif-body"><div class="notif-text">Goa Hotel expense of <strong>₹8,400</strong> created. Your share: ₹2,100.</div><div class="notif-time">Jun 25, 8:00 PM</div></div></div>
      <div class="notif-card"><div class="notif-dot read"></div><div class="notif-body"><div class="notif-text">Sunday Dinner has been fully settled.</div><div class="notif-time">Jun 27, 11:30 PM</div></div></div>
    </div>
    <div class="bottom-nav">
      <button class="nav-item" onclick="navTo(this,'screen-home')"><div class="nav-dot"></div><i class="ti ti-home" aria-hidden="true"></i><span>Home</span></button>
      <button class="nav-item" onclick="navTo(this,'screen-friends')"><div class="nav-dot"></div><i class="ti ti-users" aria-hidden="true"></i><span>Friends</span></button>
      <button class="nav-item active" onclick="navTo(this,'screen-notifs')"><div class="nav-dot"></div><i class="ti ti-bell" aria-hidden="true"></i><span>Alerts</span></button>
      <button class="nav-item"><div class="nav-dot"></div><i class="ti ti-user" aria-hidden="true"></i><span>Profile</span></button>
    </div>
  </div>

  <!-- REVIEW -->
  <div class="screen" id="screen-review">
    <div class="topbar">
      <button class="back-btn" onclick="goTo('screen-create')"><i class="ti ti-arrow-left" aria-hidden="true"></i> Back</button>
      <div class="page-title" style="margin-top:6px;">Review &amp; send</div>
    </div>
    <div class="scroll" style="padding-top:4px;">
      <div class="hero-amt-section">
        <div class="hero-label">splitting equally</div>
        <div class="hero-amt">₹5,000</div>
        <div class="hero-sub" id="review-sub">4 people · ₹1,250 each</div>
        <div class="split-bar" id="review-bar" style="margin-top:14px;height:7px;">
          <div class="split-seg" style="flex:1;background:#7C6EF5;"></div>
          <div class="split-seg" style="flex:1;background:#34C48B;"></div>
          <div class="split-seg" style="flex:1;background:#F5954B;"></div>
          <div class="split-seg" style="flex:1;background:#EF5DA8;"></div>
        </div>
      </div>
      <div class="section-label">requests going to</div>
      <div class="detail-card" id="review-list">
        <div class="d-row"><div class="av" style="background:#E8FBF3;color:#0E9E5F;width:30px;height:30px;font-size:9px;border:none;">RP</div><div class="d-name"><div class="d-name-main">Rahul Patel</div></div><div class="d-amt" style="color:#4C52D9;" id="r-rp">₹1,250</div></div>
        <div class="d-row"><div class="av" style="background:#FEF0E5;color:#C07A00;width:30px;height:30px;font-size:9px;border:none;">KM</div><div class="d-name"><div class="d-name-main">Karan Mehta</div></div><div class="d-amt" style="color:#4C52D9;" id="r-km">₹1,250</div></div>
        <div class="d-row"><div class="av" style="background:#FFF0F7;color:#C2306A;width:30px;height:30px;font-size:9px;border:none;">PS</div><div class="d-name"><div class="d-name-main">Priya Sharma</div></div><div class="d-amt" style="color:#4C52D9;" id="r-ps">₹1,250</div></div>
      </div>
      <div style="background:#F8F9FF;border-radius:10px;border:1px solid #ECEEFF;padding:11px 13px;font-size:12px;color:#9095B8;line-height:1.5;margin-bottom:10px;">Each person gets a UPI payment link. Automatic reminders after 1, 3, and 7 days if unpaid.</div>
    </div>
    <button class="cta" id="review-cta" onclick="goTo('screen-home')">Send 3 payment requests →</button>
    <div style="height:72px;flex-shrink:0;"></div>
  </div>

</div>

<script>
const TOTAL = 5000;
let participants = ['ak','rp','km','ps'];
let currentMethod = 'equal';
let pendingAdd = null;

const segColors = ['#7C6EF5','#34C48B','#F5954B','#EF5DA8','#F5444B','#4BAFF5','#A855F7'];
const participantData = {
  ak:  { initials:'AK', name:'You',          sub:'organiser',           bg:'#EEF0FF', color:'#4C52D9' },
  rp:  { initials:'RP', name:'Rahul Patel',  sub:'+91 98765 43210',    bg:'#E8FBF3', color:'#0E9E5F' },
  km:  { initials:'KM', name:'Karan Mehta',  sub:'+91 87654 32109',    bg:'#FEF0E5', color:'#C07A00' },
  ps:  { initials:'PS', name:'Priya Sharma', sub:'+91 76543 21098',    bg:'#FFF0F7', color:'#C2306A' },
  rj:  { initials:'RJ', name:'Riya Joshi',   sub:'+91 65432 10987',    bg:'#FFF2F2', color:'#E03838' },
  as:  { initials:'AS', name:'Ankit Shah',   sub:'+91 54321 09876',    bg:'#F0F8FF', color:'#1565C0' },
  nm:  { initials:'NM', name:'Neha Mishra',  sub:'+91 43210 98765',    bg:'#F5F0FF', color:'#6B21A8' },
  vs:  { initials:'VS', name:'Vikram Soni',  sub:'+91 32109 87654',    bg:'#FFF7ED', color:'#9A3412' },
};
const methodAmounts = {
  equal:   () => { const a = Math.round(TOTAL/participants.length); return participants.map(()=>a); },
  percent: () => participants.map((_,i)=> Math.round(TOTAL * [0.2,0.3,0.3,0.2,0.1,0.1,0.1][i] || TOTAL/participants.length)),
  custom:  () => participants.map((_,i)=> Math.round(TOTAL * [0.1,0.3,0.4,0.2,0.15,0.1,0.05][i] || TOTAL/participants.length)),
};

function getAmounts() { return methodAmounts[currentMethod](); }

function recalcAll() {
  const amts = getAmounts();
  participants.forEach((id, i) => {
    const el = document.getElementById('a-'+id);
    if (el) el.textContent = '₹'+amts[i].toLocaleString('en-IN');
  });
  const n = participants.length;
  const per = Math.round(TOTAL/n);
  document.getElementById('n-people').textContent = n;
  document.getElementById('per-person').textContent = '₹'+per.toLocaleString('en-IN');
}

function setMethod(el, m) {
  document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  currentMethod = m;
  recalcAll();
}

function removeParticipant(rowId) {
  const key = rowId.replace('pr-','');
  const row = document.getElementById(rowId);
  if (!row) return;
  row.style.transition = 'opacity 0.2s, transform 0.2s';
  row.style.opacity = '0';
  row.style.transform = 'translateX(10px)';
  setTimeout(() => {
    row.remove();
    participants = participants.filter(p => p !== key);
    recalcAll();
  }, 200);
}

function openSheet() {
  pendingAdd = null;
  document.querySelectorAll('.contact-check').forEach(c => {
    c.classList.remove('checked');
    c.querySelector('i').style.display = 'none';
  });
  const btn = document.getElementById('add-sheet-btn');
  btn.textContent = 'Select a contact to add';
  btn.style.opacity = '0.4';
  btn.style.pointerEvents = 'none';
  document.getElementById('contact-search').value = '';
  filterContacts('');
  document.getElementById('add-overlay').classList.add('open');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('add-overlay')) closeSheet();
}

function closeSheet() {
  document.getElementById('add-overlay').classList.remove('open');
}

function toggleContact(crId, name, sub, initials, bg, color) {
  const key = crId.replace('cr-','');
  if (participants.includes(key)) return;
  document.querySelectorAll('.contact-check').forEach(c => {
    c.classList.remove('checked');
    c.querySelector('i').style.display = 'none';
  });
  const chk = document.getElementById('chk-'+key);
  chk.classList.add('checked');
  chk.querySelector('i').style.display = '';
  pendingAdd = { key, name, sub, initials, bg, color };
  const btn = document.getElementById('add-sheet-btn');
  btn.textContent = 'Add ' + name.split(' ')[0];
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'all';
}

function confirmAdd() {
  if (!pendingAdd) return;
  const { key, name, sub, initials, bg, color } = pendingAdd;
  closeSheet();
  participants.push(key);
  const list = document.getElementById('participants-list');
  const addBtn = list.nextElementSibling;
  const row = document.createElement('div');
  row.className = 'p-row new-added';
  row.id = 'pr-'+key;
  row.innerHTML = `
    <div class="p-av" style="background:${bg};color:${color};">${initials}</div>
    <div><div class="p-name">${name}</div><div class="p-sub">${sub}</div></div>
    <div class="p-amt" id="a-${key}">₹0</div>
    <button class="p-remove" onclick="removeParticipant('pr-${key}')" aria-label="Remove ${name}"><i class="ti ti-x" style="font-size:14px;" aria-hidden="true"></i></button>
  `;
  list.appendChild(row);
  setTimeout(() => row.classList.remove('new-added'), 400);
  recalcAll();
  pendingAdd = null;

  const cr = document.getElementById('cr-'+key);
  if (cr) cr.style.opacity = '0.4';
}

function filterContacts(val) {
  const v = val.toLowerCase();
  document.querySelectorAll('.contact-row').forEach(row => {
    const name = row.querySelector('.p-name').textContent.toLowerCase();
    const sub = row.querySelector('.p-sub').textContent.toLowerCase();
    row.style.display = (name.includes(v) || sub.includes(v)) ? '' : 'none';
  });
}

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  closeSheet();
}
function navTo(el, id) {
  goTo(id);
}
</script>
