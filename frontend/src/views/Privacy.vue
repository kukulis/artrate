<script setup lang="ts">
import {ref} from "vue";

const language = ref('lt')

const changeLanguage = (lang: string) => {
  language.value = lang
}
</script>

<template>
  <div v-if="language=='en'">
    <a href="#" @click="changeLanguage('lt')">Lietuviškai</a>
    <h1>"Art Correct" Website Privacy Policy</h1>
    <div class="privacy">
      <b>Edited and valid from: 2026-01-21</b>
      <h2>Introduction</h2>
      At "Art Correct", accessible from https://art.darbelis.eu, one of our main priorities is the privacy of our
      visitors. This Privacy Policy document contains types of information that is collected and recorded by "Art
      Correct" and how we use it. If you have additional questions or require more information about our Privacy Policy,
      do not hesitate to contact us via email: <b>info@darbelis.eu.</b> This Privacy Policy applies only to our online
      activities and is valid for visitors to our website with regards to the information that they shared and/or
      collect in "Art Correct". This policy is not applicable to any information collected offline or via channels other
      than this website.
      <h2>Consent</h2>
      By using our website, you hereby consent to our Privacy Policy and agree to its
      terms.
      <h2>Information We Collect</h2>
      For registration confirmation, we ask for your email address, which is also
      used as your login username.
      To distinguish yourself from other users of the system, we also ask you to enter your name which will be displayed
      on the website.
      If you do not want to enter your name, you can use a nickname of your choice. Please do not use profanity; such
      accounts will be deactivated.
      The email address will not be displayed anywhere later, only the user number or their entered name or nickname.
      Your password is stored in a hashed form in our database.
      <h2>How We Use Your Information</h2>
      We use the information we collect in various ways, including to: • Provide,
      operate, and maintain our website; • Improve, personalize, and expand our website; • Understand and analyze how
      you use our website; • Develop new products, services, features, and functionality; • Communicate with you, either
      directly or through one of our partners, including for customer service, to provide you with updates and other
      information relating to the website, and for marketing and promotional purposes; • Send you emails; • Find and
      prevent fraud;
      <h2>Log Files</h2>
      "Art Correct" follows a standard procedure of using log files. These files log
      visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The
      information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service
      Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked
      to any information that is personally identifiable. The purpose of the information is for analyzing trends,
      administering the site, tracking users' movement on the website, and gathering demographic information.
      <h2>Advertising Partners Privacy Policies</h2>
      You may consult this list to find the Privacy Policy for each of the
      advertising partners of "Art Correct". Third-party ad servers or ad networks use technologies like cookies,
      JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on "Art
      Correct", which are sent directly to users' browser. They automatically receive your IP address when this occurs.
      These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the
      advertising content that you see on websites that you visit. Note that "Art Correct" has no access to or control
      over these cookies that are used by third-party advertisers.
      <h2>Third-Party Privacy Policies</h2>
      "Art Correct"'s
      Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the
      respective Privacy Policies of these third-party ad servers for more detailed information. It may include their
      practices and instructions about how to opt-out of certain options. You can choose to disable cookies through your
      individual browser options. To know more detailed information about cookie management with specific web browsers,
      it can be found at the browsers' respective websites. Our Privacy Policy was created with the help of the
      <a
          href="https://verslasmedia.lt/zinynas/nemokama-elektronines-parduotuves-privatumo-politika/"
          rel="noopener noreferrer" target="_blank">Verslas Media Privacy Policy Generator</a>.
      <h2>CCPA PrivacyRights</h2>
      Under the CCPA, among other rights, consumers have the right to: • Request that a business that
      collects a consumer's personal data disclose the categories and specific pieces of personal data that a business
      has collected about consumers. • Request that a business delete any personal data about the consumer that a
      business has collected. • Request that a business that sells a consumer's personal data, not sell the consumer's
      personal data. If you make a request, we have one month to respond to you. If you would like to exercise any of
      these rights, please contact us.
      <h2>GDPR Data Protection Rights</h2>
      We would like to make sure you are fully aware
      of all of your data protection rights. Every user is entitled to the following: The right to access – You have the
      right to request copies of your personal data. We may charge you a small fee for this service. The right to
      rectification – You have the right to request that we correct any information you believe is inaccurate. You also
      have the right to request that we complete the information you believe is incomplete. The right to erasure – You
      have the right to request that we erase your personal data, under certain conditions. The right to restrict
      processing – You have the right to request that we restrict the processing of your personal data, under certain
      conditions. The right to object to processing – You have the right to object to our processing of your personal
      data, under certain conditions. The right to data portability – You have the right to request that we transfer the
      data that we have collected to another organization, or directly to you, under certain conditions. If you make a
      request, we have one month to respond to you. If you would like to exercise any of these rights, please contact
      us.
      <h2>Children's Information</h2>
      Another part of our priority is adding protection for children while using the
      internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online
      activity. "Art Correct" does not knowingly collect any Personal Identifiable Information from children under the
      age of 13. If you think that your child provided this kind of information on our website, we strongly encourage
      you to contact us immediately and we will do our best efforts to promptly remove such information from our
      records.
      <h2>Contact for Questions</h2>
      Giedrius Tumelis
      <p> info@darbelis.eu </p>
      Lithuania
    </div>
  </div>
  <div v-if="language=='lt'">
    <a href="#" @click="changeLanguage('en')">English</a>
    <h1>Svetainės "Art Correct" privatumo politika</h1>

    <div class="privacy">
      <b>Redaguota ir galioja nuo: 2026-01-21</b>


      <h2>Įžanga</h2>
      "Art Correct" interneto sistemoje, kuri yra adresu https://art.darbelis.eu, vienas iš
      svarbiausių mūsų prioritetų yra mūsų lankytojų privatumas. Šiame privatumo
      politikos dokumente pateikiama informacija, kurią renka ir registruoja "Art
      Correct", ir kaip mes ją naudojame. Jei turite papildomų klausimų arba
      norite gauti daugiau informacijos apie mūsų privatumo politiką, nedvejodami
      susisiekite su mumis el. Paštu: <b>info@darbelis.eu.</b> Ši privatumo politika taikoma
      tik mūsų veiklai internete ir galioja mūsų svetainės lankytojams, kiek tai
      susiję su informacija, kuria jie dalijasi ir (arba) kurią renka "Art Correct". Ši
      politika netaikoma jokiai informacijai, surinktai ne internetu ar kitais
      kanalais, išskyrus šią svetainę.


      <h2>Sutikimas</h2>

      Naudodamiesi mūsų svetaine, jūs sutinkate su mūsų privatumo politika ir
      sutinkate su jos sąlygomis.


      <h2>Renkama informacija</h2>

      Registracijos patvirtinimui prašome įvesti savo el. pašto adresą, kuris naudojamas ir kaip paskirties
      prisijungimo vardas.
      Kad atskirti save nuo kitų sistemos naudotojų, taip pat prašome įvesti savo vardą kuris bus vaizduojamas
      svetainėje.
      Jeigu nenorite vesti savo vardo, tai galite naudoti savo pasirinktą slapyvardį. Prašome nenaudoti keiksmažodžių;
      tokios paskirtys bus deaktyvuojamos.
      El. pašto adresas vėliau nebus niekur rodomas, o tik vartotojo numeris arba jo įvestas vardas arba slapyvardis.
      Slaptažodis saugomas hešuotoj formoj mūsų duomenų bazėje ir techniškai negali būti panaudotas niekam kitam tik prisijungimui prie mūsų sistemos.


      <h2>Kaip naudojame jūsų informaciją</h2>

      Surinktą informaciją naudojame įvairiais būdais, įskaitant: • Teikti, valdyti ir
      prižiūrėti mūsų svetainę; • Tobulinti, pritaikyti ir plėsti mūsų svetainę; •
      Suprasti ir analizuoti, kaip naudojatės mūsų svetaine; • Naujų produktų,
      paslaugų, funkcijų ir funkcionalumo kūrimui; • Bendrauti su jumis tiesiogiai
      arba per vieną iš mūsų partnerių, įskaitant klientų aptarnavimo, atnaujinimų ir
      kitos su svetaine susijusios informacijos teikimo, rinkodaros ir reklamos
      tikslais; • Siųsti jums el. Laiškus; • Ieškoti sukčiavimo atvejų ir užkirsti
      jiems kelią;


      <h2>Žurnalo failai</h2>

      "Art Correct" taiko standartinę žurnalų failų naudojimo procedūrą. Šie failai
      registruoja lankytojus, kai jie lankosi interneto svetainėse. Tai daro visos
      prieglobos paslaugas teikiančios bendrovės, ir tai yra prieglobos paslaugų
      analizės dalis. Žurnalo failuose renkama informacija apima interneto protokolo
      (IP) adresus, naršyklės tipą, interneto paslaugų teikėją (IPT), datos ir laiko
      žymą, nukreipiančiuosius / išeinančiuosius puslapius ir galbūt paspaudimų
      skaičių. Šie duomenys nesusiję su jokia asmeniškai identifikuojama informacija.
      Šios informacijos paskirtis - analizuoti tendencijas, administruoti svetainę,
      sekti naudotojų judėjimą svetainėje ir rinkti demografinę informaciją.


      <h2>Reklamos partnerių privatumo politika</h2>

      Šiame sąraše galite rasti kiekvieno "Art Correct" reklamos partnerio privatumo
      politiką. Trečiųjų šalių skelbimų serveriai arba skelbimų tinklai naudoja tokias
      technologijas kaip slapukai, JavaScript arba žiniatinklio švyturiai, kurie yra
      naudojami atitinkamuose jų skelbimuose ir nuorodose, rodomuose "Art Correct",
      kurie yra siunčiami tiesiai į naudotojų naršyklę. Tokiu atveju jie automatiškai
      gauna jūsų IP adresą. Šios technologijos naudojamos jų reklamos kampanijų
      veiksmingumui matuoti ir (arba) reklamos turiniui, kurį matote jūsų lankomose
      svetainėse, pritaikyti. Atkreipkite dėmesį, kad "Art Correct" neturi prieigos prie
      šių slapukų, kuriuos naudoja trečiųjų šalių reklamuotojai, ir jų nekontroliuoja.


      <h2>Trečiųjų šalių privatumo politika</h2>

      "Art Correct" privatumo politika netaikoma kitiems reklamuotojams ar svetainėms.
      Taigi, norėdami gauti išsamesnės informacijos, patariame susipažinti su
      atitinkamomis šių trečiųjų šalių skelbimų serverių privatumo politikomis. Joje
      gali būti nurodyta jų praktika ir instrukcijos, kaip atsisakyti tam tikrų
      parinkčių. Slapukus galite išjungti naudodamiesi individualios naršyklės
      parinktimis. Išsamesnės informacijos apie slapukų valdymą su konkrečiomis
      interneto naršyklėmis rasite atitinkamose naršyklių svetainėse. Mūsų privatumo
      politika buvo sukurta naudojantis <a
        href="https://verslasmedia.lt/zinynas/nemokama-elektronines-parduotuves-privatumo-politika/"
        rel="noopener noreferrer" target="_blank">Verslas Media privatumo politikos kūrimo įrankiu</a>.


      <h2>CCPA privatumo teisės</h2>

      Pagal CCPA, be kitų teisių nustatymus, vartotojai turi teisę: • reikalauti, kad
      vartotojo asmens duomenis renkanti įmonė atskleistų, kokių kategorijų ir kokius
      konkrečius asmens duomenis apie vartotojus ji surinko. • reikalauti, kad įmonė
      ištrintų visus įmonės surinktus vartotojo asmens duomenis. • reikalauti, kad
      įmonė, kuri parduoda vartotojo asmens duomenis, neparduotų vartotojo asmens
      duomenų. Jei pateikiate užklausą, atsakymą turime pateikti per mėnesį. Jei
      norite pasinaudoti bet kuria iš šių teisių, susisiekite su mumis.


      <h2>BDAR duomenų apsaugos teisės</h2>

      Norėtume įsitikinti, kad žinote visas savo teises, susijusias su duomenų
      apsauga. Kiekvienas naudotojas turi šias teises: Teisė susipažinti - turite
      teisę prašyti savo asmens duomenų kopijų. Už šią paslaugą galime imti nedidelį
      mokestį. Teisė į ištaisymą - turite teisę prašyti, kad ištaisytume bet kokią
      informaciją, kuri, jūsų manymu, yra netiksli. Taip pat turite teisę prašyti
      papildyti, jūsų manymu, neišsamią informaciją. Teisė ištrinti duomenis - tam
      tikromis sąlygomis turite teisę prašyti, kad ištrintume jūsų asmens duomenis.
      Teisė apriboti duomenų tvarkymą - tam tikromis sąlygomis turite teisę prašyti,
      kad apribotume jūsų asmens duomenų tvarkymą. Teisė nesutikti su duomenų tvarkymu
      - tam tikromis sąlygomis turite teisę nesutikti, kad tvarkytume jūsų asmens
      duomenis. Teisė į duomenų perkėlimą - turite teisę prašyti, kad tam tikromis
      sąlygomis perduotume surinktus duomenis kitai organizacijai arba tiesiogiai
      jums. Jei pateikiate užklausą, atsakymą turime pateikti per mėnesį. Jei norite
      pasinaudoti bet kuria iš šių teisių, susisiekite su mumis.


      <h2>Informacija dėl vaikų naudojimosi svetaine</h2>

      Kitas mūsų prioritetas - užtikrinti vaikų apsaugą naudojantis internetu.
      Raginame tėvus ir globėjus stebėti, dalyvauti ir (arba) kontroliuoti jų veiklą
      internete. "Art Correct" sąmoningai nerenka jokios asmeninės informacijos iš
      jaunesnių nei 13 metų amžiaus vaikų. Jei manote, kad jūsų vaikas pateikė tokią
      informaciją mūsų svetainėje, primygtinai raginame nedelsdami susisiekti su
      mumis, ir mes padarysime viską, kas įmanoma, kad tokia informacija būtų
      nedelsiant pašalinta iš mūsų įrašų.


      <h2>Kontaktai iškilus klausimams</h2>

      Giedriaus Tumelis
      <p> info@darbelis.eu </p>
      Lietuva

    </div>
  </div>

</template>

<style scoped>
h1 {
  font-family: var(--font-display);
  color: var(--color-ink);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

h2 {
  font-family: var(--font-display);
  color: var(--color-ink);
  margin-bottom: var(--spacing-md);
  text-align: left;
}

.privacy {
  font-family: var(--font-body);
  color: var(--color-ink-muted);
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
  text-align: left;
}
</style>