import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authFeature } from '../../store/auth/auth.reducer';
import { AuthActions } from '../../store/auth/auth.actions';
import { ProductsActions } from '../../store/products/products.actions';
import { selectSearchTerm } from '../../store/products/products.selectors';
import { UserListsService } from '../../services/user-lists.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [RouterLink, AsyncPipe, FormsModule],
})
export class Header implements OnInit {
  private store  = inject(Store);
  private router = inject(Router); 
  lists          = inject(UserListsService);

  user$       = this.store.select(authFeature.selectUser);
  searchTerm$ = this.store.select(selectSearchTerm);

  @Output() onprofileClick = new EventEmitter<void>();

  ngOnInit(): void { this.lists.loadAll(); }

  onSearch(value: string): void {
    this.store.dispatch(ProductsActions.setSearchTerm({ searchTerm: value }));
  }

  profileClicked(): void { this.onprofileClick.emit(); }

  goToLogin(): void { this.router.navigate(['/login']); }

  logout(): void {
    this.lists.clear();
    this.store.dispatch(AuthActions.logout());
  }
}
