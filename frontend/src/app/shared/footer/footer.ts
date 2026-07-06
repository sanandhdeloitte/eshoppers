import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class Footer {

  readonly footerLinks = {
    shop:    ['New Arrivals', 'Best Sellers', 'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors', 'Beauty', 'Deals'],
    account: ['My Account', 'Orders', 'Wishlist', 'Cart', 'Help Centre'],
    company: ['About Us', 'Careers', 'Press', 'Blog', 'Sustainability'],
    legal:   ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'],
  };

  readonly socialLinks = [
    {
      label: 'Facebook',
      href:  'https://facebook.com',
      path:  'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
    },
    {
      label: 'Instagram',
      href:  'https://instagram.com',
      path:  'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 2h11A4.5 4.5 0 0122 6.5v11a4.5 4.5 0 01-4.5 4.5h-11A4.5 4.5 0 012 17.5v-11A4.5 4.5 0 016.5 2z',
    },
    {
      label: 'X / Twitter',
      href:  'https://twitter.com',
      path:  'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
    },
    {
      label: 'LinkedIn',
      href:  'https://linkedin.com',
      path:  'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-5a2 2 0 110 4 2 2 0 010-4z',
    },
    {
      label: 'YouTube',
      href:  'https://youtube.com',
      path:  'M22.54 6.42A2.78 2.78 0 0020.6 4.47C18.88 4 12 4 12 4s-6.88 0-8.6.47A2.78 2.78 0 001.46 6.42 29.94 29.94 0 001 12a29.94 29.94 0 00.46 5.58A2.78 2.78 0 003.4 19.53C5.12 20 12 20 12 20s6.88 0 8.6-.47a2.78 2.78 0 001.94-1.95A29.94 29.94 0 0023 12a29.94 29.94 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z',
    },
    {
      label: 'Pinterest',
      href:  'https://pinterest.com',
      path:  'M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.63-.31-1.56c0-1.46.85-2.55 1.9-2.55.9 0 1.33.67 1.33 1.48 0 .9-.58 2.26-.87 3.51-.25 1.05.52 1.9 1.54 1.9 1.84 0 3.08-2.37 3.08-5.18 0-2.14-1.44-3.74-4.04-3.74-2.94 0-4.77 2.2-4.77 4.65 0 .84.24 1.44.62 1.9.17.21.19.29.13.53-.04.17-.14.59-.18.75-.06.24-.24.33-.44.24-1.24-.51-1.82-1.88-1.82-3.41 0-2.53 2.14-5.58 6.39-5.58 3.43 0 5.68 2.49 5.68 5.17 0 3.55-1.96 6.2-4.84 6.2-.97 0-1.87-.52-2.18-1.11l-.61 2.33c-.2.75-.59 1.5-.95 2.08.72.21 1.47.33 2.25.33 5.52 0 10-4.48 10-10S17.52 2 12 2z',
    },
  ];
}
