import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  notifications = [
    {
      id: 1,
      title: 'New barter request from Sara Ahmed',
      type: 'barter',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      title: 'Your offer “Logo Design” got a new comment',
      type: 'offer',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 3,
      title: 'New message from Omar Youssef',
      type: 'message',
      time: '3 hours ago',
      read: false,
    },
    {
      id: 4,
      title: 'Your barter with Ali Hassan is now completed',
      type: 'barter',
      time: 'Yesterday',
      read: true,
    },
  ];

  markAsRead(n: any) {
    n.read = true;
  }
}
