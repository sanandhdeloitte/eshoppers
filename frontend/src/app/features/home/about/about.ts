// filename: about.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Header, RouterLink, Footer],
  templateUrl: './about.html',
})
export class AboutComponent {

  readonly stats = [
    { label: 'Products Listed',   value: '10,000+' },
    { label: 'Happy Customers',   value: '50,000+' },
    { label: 'Brand Partners',    value: '500+'    },
    { label: 'Orders Delivered',  value: '120,000+'},
    { label: 'Categories',        value: '30+'     },
    { label: 'Countries Served',  value: '25+'     },
  ];

  readonly values = [
    { icon: '🛡️', title: 'Trust & Safety',        desc: 'Every product is verified. All transactions are encrypted end-to-end. We never store card details.' },
    { icon: '🚚', title: 'Fast Delivery',          desc: 'Delivery in 2–5 business days via DHL and FedEx. Same-day available in select cities.' },
    { icon: '💬', title: '24/7 Customer Support',  desc: 'Reach us anytime by chat, email or phone. Average response time under 3 minutes.' },
    { icon: '↩️', title: '30-Day Free Returns',    desc: 'Free pickup from your door. Refund processed within 48 hours of return receipt.' },
    { icon: '💰', title: 'Best Price Guarantee',   desc: 'Found it cheaper? We match the price — no questions asked.' },
    { icon: '♻️', title: 'Sustainability',         desc: 'Recyclable packaging, carbon-offset shipping, and 1% of profit donated to green causes.' },
  ];

  readonly milestones = [
    { year: '2020', title: 'Founded in New York',          desc: 'Launched with 200 products and a $20,000 budget from a Brooklyn apartment.' },
    { year: '2021', title: 'First 10,000 Customers',       desc: 'Expanded to Electronics, Fashion and Home Décor.' },
    { year: '2022', title: 'Mobile App Launched',          desc: 'iOS and Android apps with real-time order tracking.' },
    { year: '2023', title: 'Went International',           desc: 'Shipping to 25 countries. 500+ global brand partners.' },
    { year: '2024', title: 'AI Personalisation',           desc: 'Smart search and personalised feeds powered by machine learning.' },
    { year: '2025', title: '50,000+ Happy Customers',      desc: '120,000+ orders delivered. 80-person team across 4 continents.' },
  ];

  readonly team = [
    { name: 'Sarah Mitchell', role: 'CEO & Co-Founder',        avatar: 'SM', bio: 'Former Amazon product lead with 15 years in e-commerce.' },
    { name: 'James Okafor',   role: 'CTO & Co-Founder',        avatar: 'JO', bio: 'Ex-Google engineer. Built platforms serving 100M+ users.' },
    { name: 'Priya Sharma',   role: 'Head of Operations',      avatar: 'PS', bio: 'Supply chain expert, formerly at Walmart Global Sourcing.' },
    { name: 'Luca Ferreira',  role: 'Head of Design',          avatar: 'LF', bio: 'Award-winning UX designer. Led design at two Y-Combinator startups.' },
    { name: 'Mei Lin',        role: 'Head of Customer Success', avatar: 'ML', bio: 'Built support teams from 0 to 200 agents.' },
    { name: 'David Osei',     role: 'Head of Marketing',       avatar: 'DO', bio: 'Growth marketer behind 3 successful product launches.' },
  ];

  readonly faqs = [
    { q: 'How do I track my order?',                 a: 'Once your order ships you will receive an email with a tracking link. You can also check My Orders in your account.' },
    { q: 'What payment methods do you accept?',      a: 'Visa, Mastercard, Amex, Google Pay, Apple Pay and PayPal. All payments are secured by Stripe.' },
    { q: 'How do I return a product?',               a: 'Go to My Orders, select the item and request a return. We arrange free doorstep pickup and refund within 48 hours.' },
    { q: 'Do you ship internationally?',             a: 'Yes — we ship to 25 countries. Costs and delivery times are shown at checkout.' },
    { q: 'How does the price match work?',           a: 'Show us a cheaper live listing within 7 days of purchase and we refund the difference.' },
    { q: 'Is my personal data safe?',               a: 'We are GDPR compliant, never sell data, and use AES-256 encryption. See our Privacy Policy for details.' },
  ];

  // ── NEW SECTIONS ─────────────────────────────────────────────────────────

  readonly awards = [
    { year: '2021', title: 'Best New E-Commerce Platform', org: 'TechCrunch Disrupt' },
    { year: '2022', title: 'Top Customer Experience Award', org: 'Retail Innovation Forum' },
    { year: '2023', title: 'Sustainability Leader Award', org: 'Green Commerce Alliance' },
    { year: '2024', title: 'Best Mobile Shopping App', org: 'App Store Awards' },
    { year: '2025', title: 'Fastest Growing Marketplace', org: 'Forbes Commerce 100' },
  ];

  readonly press = [
    { outlet: 'Forbes',       quote: '"eSHOPPERS is redefining what fast, ethical e-commerce looks like."', year: '2024' },
    { outlet: 'TechCrunch',   quote: '"Their customer-first approach is rare in an industry obsessed with growth hacking."', year: '2023' },
    { outlet: 'Wired',        quote: '"The team at eSHOPPERS built something that actually works for everyday shoppers."', year: '2023' },
    { outlet: 'Business Insider', quote: '"50,000 customers don\'t lie. eSHOPPERS is a serious marketplace."', year: '2024' },
  ];

  readonly categories = [
    { icon: '📱', name: 'Electronics',    count: '2,400+ products' },
    { icon: '👗', name: 'Fashion',        count: '3,100+ products' },
    { icon: '🏠', name: 'Home & Living',  count: '1,800+ products' },
    { icon: '⚽', name: 'Sports',         count: '950+ products'   },
    { icon: '💄', name: 'Beauty',         count: '700+ products'   },
    { icon: '📚', name: 'Books',          count: '500+ products'   },
    { icon: '🧸', name: 'Toys & Kids',    count: '400+ products'   },
    { icon: '🌱', name: 'Garden',         count: '150+ products'   },
  ];

  readonly guarantees = [
    { icon: '✅', title: 'Authentic Products',   desc: 'Every seller is vetted. Counterfeit items result in permanent bans.' },
    { icon: '🔒', title: 'Secure Payments',      desc: 'Powered by Stripe. PCI-DSS Level 1 compliant. No card data stored.' },
    { icon: '📦', title: 'Tracked Delivery',     desc: 'Real-time GPS tracking from warehouse to your door.' },
    { icon: '⭐', title: 'Verified Reviews',     desc: 'Only customers who purchased can leave reviews. No fake ratings.' },
    { icon: '💳', title: 'Easy Refunds',         desc: 'Automatic refund to your original payment method within 48 hrs.' },
    { icon: '📞', title: '24/7 Support',         desc: 'Real humans. Average first response under 3 minutes, day or night.' },
  ];

  readonly partnerLogos = [
    'Samsung', 'Sony', 'Nike', 'Adidas', 'Apple', 'Dell',
    'LG', 'Zara', 'H&M', 'Philips', 'Bosch', 'Canon',
  ];

  openFaqIndex: number | null = null;
  toggleFaq(i: number): void {
    this.openFaqIndex = this.openFaqIndex === i ? null : i;
  }
}
