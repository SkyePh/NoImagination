import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ThemeService } from './theme';

type SectionId = 'home' | 'dashboards' | 'tasks' | 'reports';

interface NavItem {
  id: SectionId;
  label: string;
  icon: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Home',
    items: [
      { id: 'home', label: 'Home', icon: 'pi pi-home' },
      { id: 'dashboards', label: 'Dashboards', icon: 'pi pi-chart-bar' },
    ],
  },
  {
    label: 'Work',
    items: [
      { id: 'tasks', label: 'Tasks', icon: 'pi pi-check-square' },
      { id: 'reports', label: 'Reports', icon: 'pi pi-file' },
    ],
  },
];

@Component({
  selector: 'app-portal',
  imports: [NgStyle, NgTemplateOutlet, FormsModule, Button, Card, Checkbox, InputText, Message, Select, TableModule, Tag],
  templateUrl: './portal.html',
})
export class Portal {
  protected readonly theme = inject(ThemeService);
  protected readonly collapsed = signal(false);
  protected readonly section = signal<SectionId>('home');
  protected readonly query = signal('');
  protected readonly year = signal('2026/27');
  protected readonly years = ['2024/25', '2025/26', '2026/27'];
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly category = signal('General');
  protected readonly categories = ['General', 'Academic', 'Finance'];
  protected readonly agreed = signal(false);
  protected readonly bars = [
    { label: 'Primary', width: '78%', tone: 'c2' },
    { label: 'Secondary', width: '46%', tone: 'c3' },
    { label: 'Primary', width: '62%', tone: 'c2' },
  ];
  protected readonly rows = [
    { name: 'Intake form', owner: 'Alex', status: 'Draft' },
    { name: 'Term review', owner: 'Sam', status: 'Review' },
    { name: 'Annual summary', owner: 'Jordan', status: 'Published' },
  ];

  protected readonly groups = computed(() => {
    const query = this.query().trim().toLowerCase();
    return NAV.map((group) => ({
      ...group,
      items: group.items.filter((item) => !query || item.label.toLowerCase().includes(query)),
    })).filter((group) => group.items.length > 0);
  });

  protected readonly heading = computed(() => {
    const match = NAV.flatMap((group) => group.items).find((item) => item.id === this.section());
    return match?.id === 'home' ? 'Overview' : (match?.label ?? 'Overview');
  });

  protected selectSection(id: SectionId): void {
    this.section.set(id);
  }

  protected toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
