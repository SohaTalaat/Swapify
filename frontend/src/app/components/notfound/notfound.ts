import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notfound',
  imports: [CommonModule, RouterLink],
  templateUrl: './notfound.html',
  styleUrl: './notfound.css',
})
export class Notfound {}
