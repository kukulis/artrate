<script setup lang="ts">

import {RouterLink} from "vue-router";
import {computed} from "vue";

const email1 = computed(() => {
  const eta = "@"
  return "info" + eta + "darbelis.eu"
})
const email2 = computed(() => {
  const eta = "@"
  return "info" + eta + "darbelis.eu"
})
const phone = computed(() => {
  const code1 = "+370"
  const code2 = "675"
  return code1 + ' ' + code2 + ' ' + "51468"
})
</script>

<template>
  <div class="about">
    <h1>About ArtCorrect</h1>
    <h3>
      <RouterLink to="/privacy" class="link">Privacy policy</RouterLink>
    </h3>

    The purpose of this site is to rank articles, not only by giving like or dislike, but to give a rank in various
    aspects,
    like :
    <ul>
      <li>Accuracy</li>
      <li>Objectivity</li>
      <li>Structure</li>
      <li>Ethics</li>
      <li>Logic</li>
    </ul>

    <p>There is a possibility to rank articles manually or by using AI tools.</p>

    <p>The motivation behind using AI for ranking, is to avoid bias, because people have own world view, and we <u>expect</u>
      the AI will be more objective.
      You can read more about this site purpose at <a target="_blank" href="http://gt.darbelis.eu/?p=74">http://gt.darbelis.eu/?p=74</a>
    </p>

    <p>In the current version there is a possibility to rank manually for a regular user; to use AI tools you need to
      have admin role,
      which you can ask through email info@darbelis.eu. The regular user may create 5 articles of maximum 10000
      character length in 24 hours.
      After 24 hours he may create another 5 articles and so on.</p>
  </div>
  <div class="contact-info">
    <h3>Contact info</h3>
    <p>Giedrius Tumelis</p>
    <p>Business certificate number: TODO </p>
    <p>email: {{email1}} , {{email2}}</p>
    <p>phone: {{phone}}</p>
  </div>

</template>

<style scoped>
.link {
  font-family: var(--font-body);
  color: var(--color-accent);
  text-decoration: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.link:hover {
  background-color: var(--color-paper-dark);
  text-decoration: underline;
}

.about {
  font-family: var(--font-body);
  color: var(--color-ink-muted);
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
  text-align: left;
}

.contact-info {
  font-family: var(--font-body);
  color: var(--color-ink-muted);
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
  text-align: left;
}
</style>