/*
 * Vult de wereld met de inhoud van Wassenaar. app.js laadt dit vóór de motor: modules worden in de
 * volgorde van hun imports uitgevoerd, dus de motor vindt de wereld al gevuld.
 */

import * as gegevens from './gegevens.js';
import { VERSIES } from '../wijzigingen/versies.js';
import { vul } from '../wereld.js';

vul({ ...gegevens, VERSIES });
