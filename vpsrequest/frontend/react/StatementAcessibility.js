import React from 'react';
import { BaseView, LoadingAnim, RequestHorizontalRule, Status } from './UIElements';
import { DateFormatHR } from './Util';
import {
    Col,
    Row,
    } from 'reactstrap';
import { CONFIG } from './Config'


export const StatementAccessibility = (props) => (
  <BaseView
    title="Izjava o pristupačnosti - VPS zahtjev">
    <p className="pl-2 pt-2">
      Sveučilišni računski centar (Srce) nastoji svoje mrežne stranice učiniti
      pristupačnima u skladu sa Zakonom o pristupačnosti mrežnih stranica i
      programskih rješenja za pokretne uređaje tijela javnog sektora (NN
      017/2019).
    </p>

    <p className="pl-2">
      Ova izjava o pristupačnosti primjenjuje se na mrežne stranice VPS zahtjev
      (<a href="http://vps.srce.hr/zahtjev/">http://vps.srce.hr/zahtjev/</a>).
    </p>

    <h4 className="p-2 pt-3">Stupanj usklađenosti</h4>

      <p className="pl-2">
        Ove mrežne stranice usklađene su sa Smjernicama za osiguravanje digitalne
        pristupačnosti v1.1.
      </p>

    <h4 className="p-2 pt-3">Priprema ove izjave o pristupačnosti</h4>

      <p className="pl-2">Ova je izjava sastavljena u rujnu 2020. godine.</p>

      <p className="pl-2">
        Metoda upotrijebljena za pripremu izjave je samoprocjena koju je proveo
        Sveučilišni računski centar.
      </p>

      <p className="pl-2">
        Izjava je zadnji put preispitana u rujnu 2020. godine.
      </p>

    <h4 className="p-2 pt-3">Povratne informacije i podaci za kontakt</h4>

      <p className="pl-2">
        U slučaju da korisnik treba informacije koje su na mrežnim stranicama VPS
        zahtjev u nepristupačnom obliku ili je primijetio neusklađenosti koje
        nisu obuhvaćene opisom iz stavke Nepristupačan sadržaj, korisnik se može
        javiti:
      </p>

      <ul>
        <li>
          putem e-pošte na adresu <a data-ext-link-init="true" href="mailto:pristupacnost@srce.hr" rel="nofollow" target="_blank">pristupacnost@srce.hr</a>,
        </li>
        <li>
          putem telefona Helpdeska Srca +385 1 616 5165 u radnom vremenu <a data-ext-link-init="true" href="https://www.srce.unizg.hr/helpdesk" rel="nofollow" target="_blank">Helpdeska</a>,
        </li>
        <li>
          putem službenih kanala Srca na društvenim mrežama,
        </li>
        <li>
          i poštom na adresu Josipa Marohnića 5, 10000 Zagreb.
        </li>
      </ul>

      <p className="pl-2">
        Sveučilišni računski centar dužan je na upit, obavijest ili zahtjev
        korisnika odgovoriti u roku od 15 dana od dana primitka ili ga u istom
        roku, uz detaljno obrazloženje razloga koji zahtijevaju odgodu,
        obavijestiti o naknadnom roku u kojem će na iste odgovoriti.
      </p>

    <h4 className="p-2 pt-3">Postupak praćenja provedbe propisa</h4>

      <p className="pl-2">
        Tijelo nadležno za praćenje usklađenosti mrežnih stranica i programskih
        rješenja za pokretne uređaje tijela javnog sektora sa zahtjevima
        pristupačnosti i nadzor nad provedbom Zakona o pristupačnosti je {' '}
        <a data-ext-link-init="true" href="https://www.pristupinfo.hr/" target="_blank">Povjerenik za informiranje Republike Hrvatske</a>.
      </p>

      <p className="pl-2">
        U slučaju da korisnik mrežnih stranica VPS zahtjev nije zadovoljan
        odgovorima na upit, obavijest o neusklađenostima ili smatra da Srce nije
        udovoljilo zahtjevu za pristupačnim informacijama, korisnici se mogu
        obratiti Povjereniku za informiranje putem telefona broj +385 1 4609 041
        ili putem e-pošte: <a data-ext-link-init="true" href="mailto:pristupacnost@pristupinfo.hr" rel="nofollow" target="_blank">pristupacnost@pristupinfo.hr</a>.
      </p>
  </BaseView>
)
