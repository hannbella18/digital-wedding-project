document.addEventListener("DOMContentLoaded", () => {
  /* =========================
   PHASE 1: ENVELOPE + POSTER PREVIEW
  ========================= */
  const openingScreen =
    document.getElementById("openingScreen");

  const openInvitationBtn =
    document.getElementById("openInvitationBtn");

  const posterScreen =
    document.getElementById("posterScreen");

  const posterTimer =
    document.getElementById("posterTimer");

  const continueInvitationBtn =
    document.getElementById("continueInvitationBtn");

  const viewPosterBtn =
    document.getElementById("viewPosterBtn");

  const mainContent =
    document.getElementById("mainContent");

  const weddingMusic =
  document.getElementById("weddingMusic");

  const musicControlBtn =
    document.getElementById("musicControlBtn");

  const musicControlIcon =
    musicControlBtn?.querySelector(
      ".music-control-icon"
    );

  const POSTER_DURATION_SECONDS = 30;

  let invitationIsOpening = false;
  let posterInterval = null;
  let musicHasStarted = false;
  let musicWasPlayingBeforeHidden = false;

  const reduceMotion = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  
  /* =========================
   BACKGROUND MUSIC
  ========================= */

  /* Change this value from 0 to 1 */
  if (weddingMusic) {
    weddingMusic.volume = 0.35;
  }

  /* Update the floating music button */
  const updateMusicControl = () => {
    if (!musicControlBtn || !weddingMusic) {
      return;
    }

    const isPlaying =
      !weddingMusic.paused;

    musicControlBtn.classList.toggle(
      "is-playing",
      isPlaying
    );

    musicControlBtn.setAttribute(
      "aria-pressed",
      String(isPlaying)
    );

    musicControlBtn.setAttribute(
      "aria-label",
      isPlaying
        ? "Jeda muzik"
        : "Mainkan muzik"
    );

    if (musicControlIcon) {
      musicControlIcon.textContent =
        isPlaying ? "♫" : "♪";
    }
  };

  /* Display the floating button */
  const showMusicControl = () => {
    if (!musicControlBtn) {
      return;
    }

    musicControlBtn.classList.remove(
      "is-hidden"
    );

    requestAnimationFrame(() => {
      musicControlBtn.classList.add(
        "is-visible"
      );
    });
  };

  /* Start the background music */
  const playWeddingMusic = async () => {
    if (!weddingMusic) {
      return;
    }

    showMusicControl();

    try {
      await weddingMusic.play();

      musicHasStarted = true;

      updateMusicControl();
    } catch (error) {
      /*
        Some browsers may still block playback.
        The floating button remains available so
        the guest can start it manually.
      */
      updateMusicControl();
    }
  };

  /* Pause the background music */
  const pauseWeddingMusic = () => {
    if (!weddingMusic) {
      return;
    }

    weddingMusic.pause();

    updateMusicControl();
  };

  /* Toggle music from the floating button */
  const toggleWeddingMusic = () => {
    if (!weddingMusic) {
      return;
    }

    if (weddingMusic.paused) {
      playWeddingMusic();
    } else {
      pauseWeddingMusic();
    }
  };

  /* Music-control interaction */
  if (musicControlBtn) {
    musicControlBtn.addEventListener(
      "click",
      toggleWeddingMusic
    );
  }

  /* Keep button state synchronized */
  if (weddingMusic) {
    weddingMusic.addEventListener(
      "play",
      updateMusicControl
    );

    weddingMusic.addEventListener(
      "pause",
      updateMusicControl
    );
  }
  
  /* Pause music when the guest leaves the tab or browser */
  const pauseMusicWhenPageIsHidden = () => {
    if (!weddingMusic) {
      return;
    }

    if (document.hidden) {
      pauseWeddingMusic();
    }
  };

  /* Remember the music state and pause when leaving the page */
  const rememberAndPauseMusic = () => {
    if (!weddingMusic || weddingMusic.paused) {
      return;
    }

    musicWasPlayingBeforeHidden = true;

    pauseWeddingMusic();
  };

  /* Resume only if the music was playing before leaving */
  const resumeMusicAfterReturning = () => {
    if (!musicWasPlayingBeforeHidden) {
      return;
    }

    musicWasPlayingBeforeHidden = false;

    playWeddingMusic();
  };

  /* Switching tabs, minimizing Chrome or opening another app */
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        rememberAndPauseMusic();
      } else {
        resumeMusicAfterReturning();
      }
    }
  );

  /* Leaving or closing the current page */
  window.addEventListener(
    "pagehide",
    rememberAndPauseMusic
  );

  /* Returning to a page restored by the browser */
  window.addEventListener(
    "pageshow",
    resumeMusicAfterReturning
  );
  /* Stop any existing poster countdown */
  const stopPosterTimer = () => {
    if (posterInterval) {
      window.clearInterval(posterInterval);
      posterInterval = null;
    }
  };

  /* Show the main invitation */
  const revealMainContent = () => {
    if (!mainContent) return;

    const firstReveal =
      mainContent.classList.contains("hidden");

    mainContent.classList.remove("hidden");
    mainContent.removeAttribute("aria-hidden");

    requestAnimationFrame(() => {
      mainContent.classList.add("is-visible");
    });

    document.body.classList.remove(
      "invitation-locked"
    );

    if (firstReveal && window.AOS) {
      window.setTimeout(() => {
        AOS.refreshHard();
      }, 50);
    }
  };

  /* Close poster and continue to the main page */
  const closePoster = () => {
    stopPosterTimer();

    if (posterScreen) {
      posterScreen.classList.remove("is-visible");

      posterScreen.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    revealMainContent();
  };

  /* Start the 30-second poster countdown */
  const startPosterTimer = () => {
    stopPosterTimer();

    let secondsLeft =
      POSTER_DURATION_SECONDS;

    if (posterTimer) {
      posterTimer.textContent =
        secondsLeft;
    }

    posterInterval = window.setInterval(() => {
      secondsLeft -= 1;

      if (posterTimer) {
        posterTimer.textContent =
          Math.max(secondsLeft, 0);
      }

      if (secondsLeft <= 0) {
        closePoster();
      }
    }, 1000);
  };

  /* Display the full poster */
  const showPoster = () => {
    if (!posterScreen) {
      revealMainContent();
      return;
    }

    document.body.classList.add(
      "invitation-locked"
    );

    posterScreen.classList.add("is-visible");

    posterScreen.setAttribute(
      "aria-hidden",
      "false"
    );

    startPosterTimer();
  };

  /* Start the envelope opening */
  const openInvitation = () => {
    if (
      invitationIsOpening ||
      !openingScreen
    ) {
      return;
    }

    invitationIsOpening = true;
    /*
      Start music directly from the guest's tap.
      This is required by mobile browser autoplay rules.
    */
    playWeddingMusic();

    openingScreen.classList.add(
      "is-opening"
    );

    if (openInvitationBtn) {
      openInvitationBtn.disabled = true;

      openInvitationBtn.setAttribute(
        "aria-label",
        "Jemputan sedang dibuka"
      );
    }

    const posterDelay =
      reduceMotion ? 80 : 3200;

    const openingRemovalDelay =
      reduceMotion ? 20 : 720;

    window.setTimeout(() => {
      showPoster();

      openingScreen.classList.add(
        "is-finishing"
      );

      window.setTimeout(() => {
        openingScreen.remove();
      }, openingRemovalDelay);

    }, posterDelay);
  };

  /* Open envelope by tapping anywhere */
  if (openingScreen) {
    openingScreen.addEventListener(
      "click",
      openInvitation
    );
  } else {
    revealMainContent();
  }

  /* Continue without waiting for 30 seconds */
  if (continueInvitationBtn) {
    continueInvitationBtn.addEventListener(
      "click",
      closePoster
    );
  }

  /* View the poster again from the main page */
  if (viewPosterBtn) {
    viewPosterBtn.addEventListener(
      "click",
      showPoster
    );
  }

  /* =========================
   FLOATING GARDEN DECORATIONS
  ========================= */
  const gardenDecorations =
    document.getElementById("gardenDecorations");

  const createGardenDecorations = () => {
    if (
      !gardenDecorations ||
      reduceMotion
    ) {
      return;
    }

    /*
      Keep fewer petals on mobile for better
      performance and a cleaner presentation.
    */
    const petalCount =
      window.innerWidth <= 480 ? 8 : 14;

    const fragment =
      document.createDocumentFragment();

    for (
      let index = 0;
      index < petalCount;
      index += 1
    ) {
      const petal =
        document.createElement("span");

      petal.className = "floating-petal";

      const left =
        Math.random() * 100;

      const size =
        8 + Math.random() * 9;

      const duration =
        15 + Math.random() * 10;

      const delay =
        Math.random() * -24;

      const drift =
        -55 + Math.random() * 110;

      const rotation =
        220 + Math.random() * 420;

      petal.style.setProperty(
        "--petal-left",
        `${left}%`
      );

      petal.style.setProperty(
        "--petal-size",
        `${size}px`
      );

      petal.style.setProperty(
        "--petal-duration",
        `${duration}s`
      );

      petal.style.setProperty(
        "--petal-delay",
        `${delay}s`
      );

      petal.style.setProperty(
        "--petal-drift",
        `${drift}px`
      );

      petal.style.setProperty(
        "--petal-rotate",
        `${rotation}deg`
      );

      fragment.appendChild(petal);
    }

    gardenDecorations.appendChild(fragment);
  };

  createGardenDecorations();

  /* =========================
     COUNTDOWN TIMER
  ========================= */
  const WEDDING_DATETIME = "2026-08-30T12:30:00"; // 30/08/2026 12:30 PM

  const cdDays = document.getElementById("cdDays");
  const cdHours = document.getElementById("cdHours");
  const cdMins = document.getElementById("cdMins");
  const cdSecs = document.getElementById("cdSecs");
  const countdownNote = document.getElementById("countdownNote");

  if (cdDays && cdHours && cdMins && cdSecs && countdownNote) {
    let lastValues = { d: null, h: null, m: null, s: null };

    const pad2 = (n) => String(n).padStart(2, "0");

    const tickAnim = (el) => {
      el.style.transform = "translateY(-3px) scale(1.03)";
      el.style.opacity = "0.85";
      setTimeout(() => {
        el.style.transform = "translateY(0) scale(1)";
        el.style.opacity = "1";
      }, 160);
    };

    const updateCountdown = () => {
      const target = new Date(WEDDING_DATETIME).getTime();
      const now = Date.now();
      let diff = target - now;

      if (diff <= 0) {
        cdDays.textContent = "00";
        cdHours.textContent = "00";
        cdMins.textContent = "00";
        cdSecs.textContent = "00";
        countdownNote.textContent = "Majlis sedang berlangsung / telah bermula 🤍";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);

      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * (1000 * 60);

      const secs = Math.floor(diff / 1000);

      const next = { d: days, h: hours, m: mins, s: secs };

      if (lastValues.d !== next.d) { cdDays.textContent = pad2(next.d); tickAnim(cdDays); }
      if (lastValues.h !== next.h) { cdHours.textContent = pad2(next.h); tickAnim(cdHours); }
      if (lastValues.m !== next.m) { cdMins.textContent = pad2(next.m); tickAnim(cdMins); }
      if (lastValues.s !== next.s) { cdSecs.textContent = pad2(next.s); tickAnim(cdSecs); }

      lastValues = next;
      countdownNote.textContent = "Simpan tarikh & jumpa nanti 🤍";
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* =========================
     COPY ADDRESS (optional)
  ========================= */
  const copyBtn = document.getElementById("copyAddressBtn");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const address = "Glass Castle Hall, Seremban";
      try {
        await navigator.clipboard.writeText(address);
        copyBtn.textContent = "✅ Disalin!";
        setTimeout(() => (copyBtn.textContent = "📋 Salin Alamat"), 1500);
      } catch (e) {
        alert("Tak dapat salin. Sila salin manual: " + address);
      }
    });
  }
});
