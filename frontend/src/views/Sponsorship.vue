<script setup lang="ts">

import {RouterLink} from "vue-router";
</script>

<template>
  <div>
    <h1>Parama vystant projektą</h1>

    <p>Ši sistema pati iš savęs nėra brangi (neskaitant praleisto laiko ją kuriant), bet kainuoja talpinimas serveryje (šiuo metu pasiėmiau brangesnį planą kainuoja 250EU/6mėn.),
      ir dirbtinio intelekto API.
      Yra planas pajungti daugiau LLM modelių, kad vertinimas būtų objektyvesnis, bet jie yra mokami.</p>
    <p>Pavyzdžiui:
      Paklausiau to paties AI, tai "claude opus" vieno straipsnio, sudaryto iš 10k simbolių, savikaina svyruoja nuo 1.5
      iki 10 dolerio centų.
      Arba tas pats GEMINI API nemokamas 3 mėnesius, vėliau galima naudotis nemokamai iki tam tikros intensyvumo ribos,
      bet ją viršijus atsiranda papildomi mokesčiai.
    </p>
    <dl>
      <dt>Sąskaitos numeris:</dt>
      <dd> LT327290099034481230</dd>

      <dt>Gavėjas:</dt>
      <dd> Giedrius Tumelis</dd>
      <dt>
        Paskirtis:
      </dt>
      <dd> parama vystant straipsnių vertinimo sistemą Art Correct</dd>
    </dl>
  </div>

  <hr/>

  <h3>
    <RouterLink to="/donate" class="link">Parama per paysera sistemą</RouterLink>
  </h3>
</template>

<style scoped>
h1 {
  font-family: var(--font-display);
  color: var(--color-ink);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}
h3 {
  font-family: var(--font-display);
  color: var(--color-ink);
  margin-bottom: var(--spacing-md);
}
dl {
  margin: 0;
}

dt {
  margin-top: var(--spacing-md);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-ink);
}

dd {
  color: var(--color-ink-light);
}

dt:first-child {
  margin-top: 0;
}

dd {
  margin: var(--spacing-sm) 0 var(--spacing-md) 0;
}

p {
  margin: var(--spacing-sm) 0;
  color: var(--color-ink-light);
}
</style>