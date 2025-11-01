import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse-offers.html',
  styleUrls: ['./browse-offers.css'],
})
export class BrowseOffers {
  constructor(private router: Router) {} // ✅ لازم نعرّف الـ Router هنا

  offers = [
    {
      id: 1,
      title: 'Logo Design Service',
      category: 'Service',
      location: 'Cairo, Egypt',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmJBRw3VdEFAEJy3EvCjuF_zVYXEba0iBmMw&s',
      want: 'Content Writing',
      user: 'Ahmed Hassan',
    },
    {
      id: 2,
      title: 'Used iPhone 11',
      category: 'Product',
      location: 'Alexandria, Egypt',
      image:
        'https://opensooq-images.os-cdn.com/previews/2048x0/25/54/2554c3cff82552b694812d8c18414055d86850a9b923dab132589e71ee54ab51.jpg.webp',
      want: 'Bluetooth Headphones',
      user: 'Sara Ali',
    },
    {
      id: 3,
      title: 'Web Development',
      category: 'Service',
      location: 'Giza, Egypt',
      image:
        'https://media.licdn.com/dms/image/v2/D5612AQHyLFkv9YBcGA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1715058774193?e=2147483647&v=beta&t=7yqv62DbvJWPvycGiDX4FGb79GOPsVB_dreB-SHh36E',
      want: 'UI/UX Design',
      user: 'Omar Youssef',
    },
  ];

  selectedCategory = 'All';
  searchTerm = '';

  get filteredOffers() {
    return this.offers.filter((o) => {
      const matchesCategory =
        this.selectedCategory === 'All' || o.category === this.selectedCategory;
      const matchesSearch = o.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  viewOffer(id: number) {
    console.log('Navigating to offer', id);
    this.router.navigate(['/OfferDetails', id]); // ✅ استخدم نفس الاسم اللي في routes
  }
}
