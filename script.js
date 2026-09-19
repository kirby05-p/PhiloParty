const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rangeP = (p, s, e) => clamp((p - s) / (e - s), 0, 1);

/* ---------- envelope open: also triggers the disco ball + music ---------- */
const stage = document.getElementById('stage');
const envWrap = document.getElementById('envWrap');
const tapHint = document.getElementById('tapHint');
const disco = document.getElementById('disco');
const bgMusic = document.getElementById('bgMusic');
let discoOn = false;

function openEnvelope() {
  if (stage.classList.contains('opened')) return;
  stage.classList.add('opened');
  tapHint.style.opacity = '0';

  discoOn = true;
  disco.classList.add('on');

  musicControl.classList.add('on');
  bgMusic.volume = parseFloat(volumeSlider.value);
  bgMusic.play().catch(() => { /* browser blocked autoplay until a direct gesture; the click above counts as one, but ignore errors just in case */ });
}
envWrap.addEventListener('click', openEnvelope);
envWrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openEnvelope(); });

/* ---------- floating music control ---------- */
const musicControl = document.getElementById('musicControl');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');

muteBtn.addEventListener('click', () => {
  bgMusic.muted = !bgMusic.muted;
  muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
});
volumeSlider.addEventListener('input', () => {
  bgMusic.volume = parseFloat(volumeSlider.value);
  if (bgMusic.muted && bgMusic.volume > 0) { bgMusic.muted = false; muteBtn.textContent = '🔊'; }
});

new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting && discoOn) disco.classList.add('off');
    else disco.classList.remove('off');
  });
}, { threshold: 0 }).observe(document.getElementById('pageEnd'));

/* ---------- slide content: reflection + philosophical idea ---------- */
const slides = [
  "Humans are not isolated individuals. We form relationships, seek belonging, communicate, imitate others, create communities, and construct parts of our identity through interaction with other people.",
  "We ask: If humans are naturally social, what happens when our social lives become increasingly mediated by trends, algorithms, consumerism, and performance?",
  "The human person is inherently social because we do not develop our identities, beliefs, desires, and understanding of ourselves entirely on our own. We need other people to communicate, form relationships, belong to communities, and discover who we are. Our relationships with others shape how we see ourselves and the world.",
  "To be human is to be social but being social comes with a tension. We need others to develop ourselves, yet we can also lose ourselves in the expectations of other.",
  "Our digital artifact uses something familiar and humorous to Gen Z which is a party invitation to explore the social being of a human.",
  "This connects to Plato’s Allegory of the Cave. In the cave, people mistake shadows on a wall for reality because that is the only reality they have been exposed to. Similarly, our modern social world is filled with images, trends, opinions, and lifestyles presented to us through social media. We can sometimes mistake what is popular or socially accepted for what is genuinely meaningful.",
  "A Labubu everyone owns, a viral Dubai chewy cookie, an outfit that's trending, a curated online self, and even situationships and dating apps show how our desires are shaped by the people around us.",
  "This doesn't make these things fake or bad. It shows something fundamental: our desires are socially shaped. We look to others to know what's desirable, acceptable, or worth pursuing.",
  "This connects to performative identity. Every post, outfit, and trend we join isn't just self-expression — it's self-presentation, because we long for connection with the people watching.",
  "The party becomes an allegory for society, while the trends, social-media symbols, dating apps, consumer products, and viral foods represent the “shadows on the wall” that we encounter every day. Just as Plato asks whether we can distinguish reality from the shadows we have become accustomed to, our project asks whether we can distinguish genuine selfhood from the identities and desires society gives us."
];

let slideIdx = 0;
const slideImg = document.getElementById('slideImg');
const slideFallback = document.getElementById('slideFallback');
const slideCaption = document.getElementById('slideCaption');
const lcdIndex = document.getElementById('lcdIndex');
const IMG_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

function tryLoadImage(n, extIdx) {
  if (extIdx >= IMG_EXTS.length) {
    slideImg.style.display = 'none';
    slideFallback.style.display = 'flex';
    slideFallback.textContent = `[ add images/${n}.png, .jpg or .gif ]`;
    return;
  }
  slideImg.onerror = () => tryLoadImage(n, extIdx + 1);
  slideImg.onload = () => { slideImg.style.display = ''; slideFallback.style.display = 'none'; };
  slideImg.src = `images/${n}.${IMG_EXTS[extIdx]}`;
}

function setSlide(i) {
  slideIdx = (i + slides.length) % slides.length;
  const n = slideIdx + 1;
  slideImg.alt = `[ add images/${n}.png, .jpg or .gif ]`;
  tryLoadImage(n, 0);
  slideCaption.textContent = slides[slideIdx];
  lcdIndex.textContent = `${n} / ${slides.length}`;
}
setSlide(0);

document.getElementById('zoomT').addEventListener('click', () => setSlide(slideIdx + 1));
document.getElementById('zoomW').addEventListener('click', () => setSlide(slideIdx - 1));
document.getElementById('okBtn').addEventListener('click', () => setSlide(slideIdx + 1));
document.getElementById('trashBtn').addEventListener('click', () => setSlide(0));

/* autoplay via playback button */
let autoTimer = null;
const playbackBtn = document.getElementById('playbackBtn');
function toggleAutoplay() {
  const on = playbackBtn.classList.toggle('active');
  playbackBtn.textContent = on ? '\u275A\u275A' : '\u25B6';
  if (on) autoTimer = setInterval(() => setSlide(slideIdx + 1), 3200);
  else clearInterval(autoTimer);
}
playbackBtn.addEventListener('click', toggleAutoplay);

/* ---------- camera flip ---------- */
const camera3d = document.getElementById('camera3d');
const startBtn = document.getElementById('startBtn');
const menuBtn = document.getElementById('menuBtn');

function flipToBack() { camera3d.classList.add('flipped'); }
function flipToFront() { camera3d.classList.remove('flipped'); }
startBtn.addEventListener('click', flipToBack);
menuBtn.addEventListener('click', flipToFront);

/* ---------- scroll-linked zoom of the camera ---------- */
const cameraSection = document.getElementById('cameraSection');
const camScaleWrap = document.getElementById('camScaleWrap');
const GROW_RANGE = [0, 0.4];

function update() {
  const rect = cameraSection.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  const p = clamp(-rect.top / total, 0, 1);

  const growP = rangeP(p, ...GROW_RANGE);
  const scale = lerp(0.3, 1, growP);
  const opacity = lerp(0.4, 1, growP);
  camScaleWrap.style.transform = `scale(${scale})`;
  camScaleWrap.style.opacity = opacity;

  startBtn.classList.toggle('show', growP > 0.9 && !camera3d.classList.contains('flipped'));
}
window.addEventListener('scroll', () => requestAnimationFrame(update));
window.addEventListener('resize', () => requestAnimationFrame(update));
update();