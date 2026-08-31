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
const CHAT_SELECTOR = '.fixed.bottom-14.left-4.z-\\[100\\]';

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

    const preparePanel = (panel: HTMLElement) => {
      panel.id = 'pixelbattle-chat';
      panel.setAttribute('data-pb-chat-panel', 'true');
      panel.style.scrollMarginBottom = '90px';
    };

    const buildSelector = (panel: HTMLElement) => {
      preparePanel(panel);
      if (panel.querySelector('[data-pb-chat-country]')) return;
      const nameInput = panel.querySelector('input[placeholder="Your name..."]') as HTMLInputElement | null;
      if (!nameInput) return;
      const wrapper = nameInput.parentElement;
      if (!wrapper) return;

      const row = document.createElement('div');
      row.setAttribute('data-pb-chat-country', 'true');
      row.style.cssText = 'margin-top:10px;';
      row.innerHTML = `<label style="display:block;color:#61748b;font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:800;margin-bottom:6px">Country</label><select aria-label="Chat country" style="width:100%;height:42px;border-radius:12px;padding:0 12px;background:#fff;color:#10243e;border:1px solid #d8e7f5;outline:none;font-size:13px"></select><div style="font-size:10px;color:#61748b;margin-top:5px">This country appears next to your name in chat.</div>`;
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

    /* Mobile browsers should manage the visual viewport themselves. Never call
       scrollIntoView here: it is the source of the Home-screen jump on focus. */
    const focusGuard = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
      if (!target.closest(CHAT_SELECTOR)) return;
      document.documentElement.classList.add('pb-chat-keyboard');
    };
    document.addEventListener('focusin', focusGuard, true);

    const handleChatNav = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href="#pixelbattle-chat"]') as HTMLAnchorElement | null;
      if (!link) return;
      event.preventDefault();
      const panel = document.querySelector(CHAT_SELECTOR) as HTMLElement | null;
      if (!panel) return;
      preparePanel(panel);
      const input = panel.querySelector('input[placeholder="Your name..."], textarea, input[type="text"]') as HTMLInputElement | HTMLTextAreaElement | null;
      input?.focus({ preventScroll: true });
    };
    document.addEventListener('click', handleChatNav, true);

    const syncSavedCountry = () => syncMainCountry();
    syncSavedCountry();

    const observer = new MutationObserver(() => {
      document.querySelectorAll(CHAT_SELECTOR).forEach(el => buildSelector(el as HTMLElement));
      syncSavedCountry();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', focusGuard, true);
      document.removeEventListener('click', handleChatNav, true);
      document.documentElement.classList.remove('pb-chat-keyboard');
    };
  }, []);

  return null;
}
