/*
 * Stuurt een oud adres door naar het nieuwe, met het deel na # erbij (zoals #loggen). Het doel
 * staat in data-naar op de scripttag. Zonder JavaScript doet de meta-refresh het, en er is een link.
 */

const naar = document.currentScript?.dataset.naar;
if (naar) location.replace(new URL(naar + location.search + location.hash, location.href));
