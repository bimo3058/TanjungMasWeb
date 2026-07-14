import type { Component } from 'vue'

/** Satu tab pada bottom nav (AppTabBar) — dipakai panel admin & situs publik. */
export interface Tab {
  /** Nama rute tujuan. Rute anak (`<name>-baru`) ikut menyalakan tab ini. */
  name: string
  label: string
  icon: Component
}
