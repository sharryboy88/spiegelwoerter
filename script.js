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

let room = ''
let playerName = ''
const wordList = [ "Apfel", "Elefant", "Zahnbürste", "Weltraum", "Banane", "Rakete", "Pirat", "Regenbogen", "Schloss", "Giraffe",
"Trommel", "Pizza", "Vulkan", "Polizei", "Hexe", "Drache", "Panda", "Strand", "Roboter", "Torte",
"Flugzeug", "Sofa", "Kaktus", "Eis", "Bibliothek", "Frosch", "Handy", "Schlüssel", "Regen", "Schneemann",
"Höhle", "Traktor", "Pinsel", "Löwe", "Geisterbahn", "Karotte", "Zahnarzt", "UFO", "Zebra", "Schaufel",
"Würfel", "Tunnel", "Brille", "Pfanne", "Insel", "Koala", "Magnet", "Schatz", "Pinguin", "Boot",
"Igel", "Krone", "Hammer", "Zauberer", "Schule", "Tintenfisch", "Tafel", "Gurke", "Radio", "Rucksack",
"Mixer", "Schere", "Ananas", "Monster", "Schokolade", "Aquarium", "Trampolin", "Sandburg", "Vampir", "Seil",
"Huhn", "Käse", "Robbe", "Glühbirne", "Mikroskop", "Melone", "Gitarre", "Becher", "Seestern", "Teleskop",
"Bus", "Seife", "Schnecke", "Planet", "Teddybär", "Wolke", "Kleber", "Fernbedienung", "Pilz", "Pyramide",
"Gletscher", "Eule", "Mumie", "Surfbrett" ]

joinBtn.addEventListener('click', async () => {
  room = roomInput.value.trim()
  playerName = nameInput.value.trim()
  if (!room || !playerName) return alert('Bitte Raumcode und Namen eingeben.')

  await supabase.from('rooms').insert({ room, name: playerName })

  joinBtn.style.display = 'none'
  roomInput.style.display = 'none'
  nameInput.style.display = 'none'
  waitingDiv.style.display = 'block'

  updatePlayerList()

  supabase
    .channel('room-' + room)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, updatePlayerList)
    .subscribe()
})

async function updatePlayerList() {
  const { data, error } = await supabase.from('rooms').select('*').eq('room', room)
  if (error) return console.error(error)

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
  await supabase.from('rooms').update({ role }).eq('room', room).eq('name', playerName)
  roleChoice.innerHTML = '<p>✅ Rolle gespeichert. Warte auf den anderen Spieler...</p>'
  checkIfBothReady()
}

async function checkIfBothReady() {
  const { data } = await supabase.from('rooms').select('*').eq('room', room)
  if (data.length === 2 && data.every(p => p.role)) {
    const word = wordList[Math.floor(Math.random() * wordList.length)]
    const me = data.find(p => p.name === playerName)
    resultDiv.style.display = 'block'
    resultDiv.innerHTML = me.role === 'word' ? `<h2>🔑 Dein Wort: ${word}</h2>` : `<h2>🤫 Du musst bluffen!</h2>`
  } else {
    setTimeout(checkIfBothReady, 1000)
  }
}
