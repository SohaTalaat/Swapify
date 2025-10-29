import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { About } from '../about/about';
import { Contact } from '../contact/contact';
import { Faq } from '../faq/faq';
import { TermsPrivacy } from '../terms-privacy/terms-privacy';
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, About, Contact, Faq, TermsPrivacy],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
