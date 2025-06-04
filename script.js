
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mnsugeicwtixdenfncni.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3VnZWljd3RpeGRlbmZuY25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDA4MjMsImV4cCI6MjA2NDYxNjgyM30.t_HE_l-Oi-IiNmHtcgP3-IOXXY_IW5j3HJLMHCbDqt8'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const joinBtn = document.getElementById('joinBtn')
const roomInput = document.getElementById('roomInput')
const nameInput = document.getElementById('nameInput')
const waitingDiv = document.getElementById('waiting')
const playersList = document.getElementById('playersList')
const roleChoice = document.getElementById('roleChoice')
const seeWordBtn = document.getElementById('seeWordBtn')
const bluffBtn = document.getElementById('bluffBtn')
const resultDiv = document.getElementById('result')
const resetBtn = document.getElementById('resetBtn')

let room = ''
let playerName = ''

const wordList = ["Apfel", "Drache", "Pizza", "Rakete", "Insel", "Zug", "Elefant", "Polizei"]

function nowISO() {
  return new Date().toISOString()
}

window.addEventListener('beforeunload', async () => {
  await cleanup()
})

resetBtn.addEventListener('click', async () => {
  await cleanup()
  location.reload()
})

async function cleanup() {
  await supabase.from('rooms').delete().eq('room', room).eq('name', playerName)
  localStorage.clear()
}

window.addEventListener('DOMContentLoaded', async () => {
  const savedRoom = localStorage.getItem('room')
  const savedName = localStorage.getItem('name')
  if (savedRoom && savedName) {
    room = savedRoom
    playerName = savedName

    const { data } = await supabase.from('rooms')
      .select('*')
      .eq('room', room)
      .eq('name', playerName)

    if (data && data.length > 0) {
      initUI()
      updatePlayerList()
    }
  }
})

joinBtn.addEventListener('click', async () => {
  room = roomInput.value.trim()
  playerName = nameInput.value.trim()
  if (!room || !playerName) return alert('Bitte Raumcode und Namen eingeben.')

  localStorage.setItem('room', room)
  localStorage.setItem('name', playerName)

  const { error } = await supabase.from('rooms').upsert({
    room, name: playerName, role: null, last_active: nowISO()
  }, { onConflict: ['room', 'name'] })

  if (error) {
    alert("Fehler beim Beitreten: " + error.message)
    return
  }

  initUI()
  updatePlayerList()
})

function initUI() {
  joinBtn.style.display = 'none'
  roomInput.style.display = 'none'
  nameInput.style.display = 'none'
  waitingDiv.style.display = 'block'
  resetBtn.style.display = 'block'

  supabase.channel('room-' + room)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'rooms',
      filter: 'room=eq.' + room
    }, updatePlayerList)
    .subscribe()
}

async function updatePlayerList() {
  const { data } = await supabase.from('rooms').select('*').eq('room', room)
  if (!data) return

  playersList.innerHTML = ''
  data.forEach(p => {
    const li = document.createElement('li')
    li.textContent = p.name
    playersList.appendChild(li)
  })

  if (data.length === 2) {
    waitingDiv.innerHTML = '<p>✅ Beide Spieler im Raum! Wähle deine Rolle...</p>'
    roleChoice.style.display = 'block'
  }
}

seeWordBtn.addEventListener('click', () => handleChoice('word'))
bluffBtn.addEventListener('click', () => handleChoice('bluff'))

async function handleChoice(role) {
  await supabase.from('rooms').update({ role, last_active: nowISO() }).eq('room', room).eq('name', playerName)
  roleChoice.innerHTML = '<p>✅ Rolle gespeichert. Warte auf den anderen Spieler...</p>'
  checkIfBothReady()
}

async function checkIfBothReady() {
  const { data } = await supabase.from('rooms').select('*').eq('room', room)
  if (data.length === 2) {
    if (data.every(p => p.role === 'bluff')) {
      resultDiv.style.display = 'block'
      resultDiv.innerHTML = `
        <h2>🚫 Beide bluffen! Das ergibt keinen Sinn 🚫</h2>
        <p>Bitte entscheidet euch neu:</p>
        <button id="reselectBtn">🔁 Zurück zur Auswahl 🔁</button>
      `
      document.getElementById('reselectBtn').onclick = async () => {
        await supabase.from('rooms').update({ role: null }).eq('room', room)
        resultDiv.style.display = 'none'
        setTimeout(updatePlayerList, 500)
      }
      return
    }

    let sharedWord = data[0].word
    if (!sharedWord) {
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
      if (sorted[0].name === playerName) {
        sharedWord = wordList[Math.floor(Math.random() * wordList.length)]
        await supabase.from('rooms').update({ word: sharedWord }).eq('room', room)
      } else {
        setTimeout(checkIfBothReady, 1000)
        return
      }
    }

    const { data: confirmed } = await supabase.from('rooms').select('*').eq('room', room).eq('name', playerName)
    const me = confirmed[0]
    resultDiv.style.display = 'block'
    resultDiv.innerHTML = me.role === 'word'
      ? `<h2>🔑 Dein Wort: ${sharedWord}</h2>`
      : `<h2>🤫 Du musst bluffen!</h2>`
  } else {
    setTimeout(checkIfBothReady, 1000)
  }
}
