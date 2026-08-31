'use client';

import { useEffect } from 'react';

const COUNTRIES = [
  ['global', '🌍 Global'], ['af', '🇦🇫 Afghanistan'], ['al', '🇦🇱 Albania'], ['dz', '🇩🇿 Algeria'], ['ad', '🇦🇩 Andorra'],
  ['ao', '🇦🇴 Angola'], ['ar', '🇦🇷 Argentina'], ['am', '🇦🇲 Armenia'], ['au', '🇦🇺 Australia'], ['at', '🇦🇹 Austria'],
  ['az', '🇦🇿 Azerbaijan'], ['bs', '🇧🇸 Bahamas'], ['bh', '🇧🇭 Bahrain'], ['bd', '🇧🇩 Bangladesh'], ['bb', '🇧🇧 Barbados'],
  ['by', '🇧🇾 Belarus'], ['be', '🇧🇪 Belgium'], ['bz', '🇧🇿 Belize'], ['bj', '🇧🇯 Benin'], ['bt', '🇧🇹 Bhutan'],
  ['bo', '🇧🇴 Bolivia'], ['ba', '🇧🇦 Bosnia and Herzegovina'], ['bw', '🇧🇼 Botswana'], ['br', '🇧🇷 Brazil'], ['bn', '🇧🇳 Brunei'],
  ['bg', '🇧🇬 Bulgaria'], ['bf', '🇧🇫 Burkina Faso'], ['bi', '🇧🇮 Burundi'], ['kh', '🇰🇭 Cambodia'], ['cm', '🇨🇲 Cameroon'],
  ['ca', '🇨🇦 Canada'], ['cl', '🇨🇱 Chile'], ['cn', '🇨🇳 China'], ['co', '🇨🇴 Colombia'], ['cr', '🇨🇷 Costa Rica'],
  ['hr', '🇭🇷 Croatia'], ['cy', '🇨🇾 Cyprus'], ['cz', '🇨🇿 Czech Republic'], ['dk', '🇩🇰 Denmark'], ['ec', '🇪🇨 Ecuador'],
  ['eg', '🇪🇬 Egypt'], ['ee', '🇪🇪 Estonia'], ['et', '🇪🇹 Ethiopia'], ['fi', '🇫🇮 Finland'], ['fr', '🇫🇷 France'],
  ['ge', '🇬🇪 Georgia'], ['de', '🇩🇪 Germany'], ['gh', '🇬🇭 Ghana'], ['gr', '🇬🇷 Greece'], ['hu', '🇭🇺 Hungary'],
  ['is', '🇮🇸 Iceland'], ['in', '🇮🇳 India'], ['id', '🇮🇩 Indonesia'], ['ie', '🇮🇪 Ireland'], ['il', '🇮🇱 Israel'],
  ['it', '🇮🇹 Italy'], ['jp', '🇯🇵 Japan'], ['kz', '🇰🇿 Kazakhstan'], ['ke', '🇰🇪 Kenya'], ['lv', '🇱🇻 Latvia'],
  ['lb', '🇱🇧 Lebanon'], ['lt', '🇱🇹 Lithuania'], ['lu', '🇱🇺 Luxembourg'], ['my', '🇲🇾 Malaysia'], ['mt', '🇲🇹 Malta'],
  ['mx', '🇲🇽 Mexico'], ['md', '🇲🇩 Moldova'], ['mc', '🇲🇨 Monaco'], ['me', '🇲🇪 Montenegro'], ['ma', '🇲🇦 Morocco'],
  ['nl', '🇳🇱 Netherlands'], ['nz', '🇳🇿 New Zealand'], ['ng', '🇳🇬 Nigeria'], ['mk', '🇲🇰 North Macedonia'], ['no', '🇳🇴 Norway'],
  ['pk', '🇵🇰 Pakistan'], ['pa', '🇵🇦 Panama'], ['pe', '🇵🇪 Peru'], ['ph', '🇵🇭 Philippines'], ['pl', '🇵🇱 Poland'],
  ['pt', '🇵🇹 Portugal'], ['qa', '🇶🇦 Qatar'], ['ro', '🇷🇴 Romania'], ['ru', '🇷🇺 Russia'], ['sa', '🇸🇦 Saudi Arabia'],
  ['rs', '🇷🇸 Serbia'], ['sg', '🇸🇬 Singapore'], ['sk', '🇸🇰 Slovakia'], ['si', '🇸🇮 Slovenia'], ['za', '🇿🇦 South Africa'],
  ['es', '🇪🇸 Spain'], ['se', '🇸🇪 Sweden'], ['ch', '🇨🇭 Switzerland'], ['tw', '🇹🇼 Taiwan'], ['th', '🇹🇭 Thailand'],
  ['tr', '🇹🇷 Turkey'], ['ua', '🇺🇦 Ukraine'], ['ae', '🇦🇪 United Arab Emirates'], ['gb', '🇬🇧 United Kingdom'],
  ['us', '🇺🇸 United States'], ['uy', '🇺🇾 Uruguay'], ['uz', '🇺🇿 Uzbekistan'], ['ve', '🇻🇪 Venezuela'], ['vn', '🇻🇳 Vietnam'],
  ['zm', '🇿🇲 Zambia'], ['zw', '🇿🇼 Zimbabwe'],
] as const;

const STORAGE_KEY = 'pb_chat_country';

export default function ChatEnhancements() {
  useEffect(() => {
    const getSavedCountry = () => localStorage.getItem(STORAGE_KEY) || 'global';

    const syncMainCountry = (value?: string) => {
      const selects = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
      const countrySelect = selects.find(s => Array.from(s.options).some(o => o.textContent?.trim() === 'Poland'));
      if (!countrySelect) return;
      const next = value || localStorage.getItem(STORAGE_KEY) || countrySelect.value || 'global';
      if (COUNTRIES.some(([code]) => code === next)) {
        countrySelect.value = next;
        countrySelect.dispatchEvent(new Event('input', { bubbles: true }));
        countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
        localStorage.setItem(STORAGE_KEY, next);
      }
    };

    const buildSelector = (panel: HTMLElement) => {
      if (panel.querySelector('[data-pb-chat-country]')) return;
      const nameInput = panel.querySelector('input[placeholder="Your name..."]') as HTMLInputElement | null;
      if (!nameInput) return;
      const wrapper = nameInput.parentElement;
      if (!wrapper) return;

      const row = document.createElement('div');
      row.setAttribute('data-pb-chat-country', 'true');
      row.style.cssText = 'margin-top:10px;';
      row.innerHTML = `
        <label style="display:block;color:#9fb0c7;font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:800;margin-bottom:6px">Country</label>
        <select aria-label="Chat country" style="width:100%;height:42px;border-radius:12px;padding:0 12px;background:#101b2b;color:#f5f9ff;border:1px solid rgba(0,229,255,.28);outline:none;font-size:13px"></select>
        <div style="font-size:10px;color:#6f8199;margin-top:5px">This country appears next to your name in chat.</div>`;
      wrapper.appendChild(row);

      const select = row.querySelector('select') as HTMLSelectElement;
      COUNTRIES.forEach(([code, label]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = label;
        select.appendChild(option);
      });
      select.value = getSavedCountry();
      select.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY, select.value);
        syncMainCountry(select.value);
        window.dispatchEvent(new CustomEvent('pb-chat-country-changed', { detail: select.value }));
      });
    };

    const installMobileFocusGuard = () => {
      const handler = (event: FocusEvent) => {
        const target = event.target as HTMLElement | null;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
        if (!target.closest('.fixed.bottom-14.left-4')) return;
        document.documentElement.classList.add('pb-chat-keyboard');
        setTimeout(() => {
          const chat = document.querySelector('.fixed.bottom-14.left-4') as HTMLElement | null;
          if (chat) chat.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }, 50);
      };
      document.addEventListener('focusin', handler, true);
      return () => document.removeEventListener('focusin', handler, true);
    };

    const syncSavedCountry = () => syncMainCountry();
    const focusCleanup = installMobileFocusGuard();
    syncSavedCountry();

    const observer = new MutationObserver(() => {
      document.querySelectorAll('.fixed.bottom-14.left-4').forEach(el => buildSelector(el as HTMLElement));
      syncSavedCountry();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      focusCleanup();
      document.documentElement.classList.remove('pb-chat-keyboard');
    };
  }, []);

  return null;
}
