import os
import sys
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import json
from openpyxl import Workbook

# Add current dir to path to import generate_huyvu_xlsx
sys.path.append('/chikiet/kata2025/ragketoan/python')
import generate_huyvu_xlsx

def distribute_others(results):
    print("Performing proportional distribution of OTH-GEN to other categories...")
    all_groups = results['all_groups']
    if 'OTH-GEN' not in all_groups:
        return results

    target_groups = [g for g in all_groups if g != 'OTH-GEN']
    if not target_groups: return results

    # --- STEP 1: Opening Balance Distribution (Month 1) ---
    m1 = results['monthly_data'][1]
    oth_m1 = m1['OTH-GEN']
    ratio = 0.90 # Distribute 90% of OTH-GEN
    
    qty_to_move = oth_m1['ton_dau_sl'] * ratio
    val_to_move = oth_m1['ton_dau_val'] * ratio
    
    q_per = qty_to_move / len(target_groups)
    v_per = val_to_move / len(target_groups)
    
    for g in target_groups:
        m1[g]['ton_dau_sl'] += q_per
        m1[g]['ton_dau_val'] += v_per
        oth_m1['ton_dau_sl'] -= q_per
        oth_m1['ton_dau_val'] -= v_per

    # --- STEP 2: Monthly Proportional Distribution & Fix Loop ---
    for m in range(1, 13):
        oth = results['monthly_data'][m]['OTH-GEN']
        
        # Move 90% of this month's activity ONLY IF IT IS POSITIVE
        # This prevents spreading negative adjustments to other categories
        n_sl = max(0, oth['nhap_sl'] * ratio)
        n_val = max(0, oth['nhap_val'] * ratio)
        x_sl = max(0, oth['xuat_sl'] * ratio)
        x_val_ban = max(0, oth['xuat_val_ban'] * ratio)
        x_val_cogs = max(0, oth['xuat_val_cogs'] * ratio)
        
        if n_sl > 0 or n_val > 0 or x_sl > 0 or x_val_ban > 0 or x_val_cogs > 0:
            ns_per = n_sl / len(target_groups)
            nv_per = n_val / len(target_groups)
            xs_per = x_sl / len(target_groups)
            xv_per = x_val_ban / len(target_groups)
            xc_per = x_val_cogs / len(target_groups)
            
            for g in target_groups:
                d = results['monthly_data'][m][g]
                d['nhap_sl'] += ns_per
                d['nhap_val'] += nv_per
                d['xuat_sl'] += xs_per
                d['xuat_val_ban'] += xv_per
                d['xuat_val_cogs'] += xc_per
                
                oth['nhap_sl'] -= ns_per
                oth['nhap_val'] -= nv_per
                oth['xuat_sl'] -= xs_per
                oth['xuat_val_ban'] -= xv_per
                oth['xuat_val_cogs'] -= xc_per

        # --- STEP 3: Fix Problematic Items & Recalculate ---
        for g in all_groups:
            d = results['monthly_data'][m][g]
            # Recalculate ton_cuoi
            d['ton_cuoi_sl'] = d['ton_dau_sl'] + d['nhap_sl'] - d['xuat_sl']
            d['ton_cuoi_val'] = d['ton_dau_val'] + d['nhap_val'] - d['xuat_val_cogs']
            
            # Fix Negative Quantity (if any left)
            if d['ton_cuoi_sl'] < -0.001 and g != 'OTH-GEN':
                diff_sl = -d['ton_cuoi_sl']
                d['nhap_sl'] += diff_sl
                oth['nhap_sl'] -= diff_sl
                unit_price = oth['ton_dau_val'] / oth['ton_dau_sl'] if oth['ton_dau_sl'] > 0 else 500000
                diff_val = diff_sl * unit_price
                d['nhap_val'] += diff_val
                oth['nhap_val'] -= diff_val
                # Recalculate
                d['ton_cuoi_sl'] = d['ton_dau_sl'] + d['nhap_sl'] - d['xuat_sl']
                d['ton_cuoi_val'] = d['ton_dau_val'] + d['nhap_val'] - d['xuat_val_cogs']
                oth['ton_cuoi_sl'] = oth['ton_dau_sl'] + oth['nhap_sl'] - oth['xuat_sl']
                oth['ton_cuoi_val'] = oth['ton_dau_val'] + oth['nhap_val'] - oth['xuat_val_cogs']

            # Fix Zero Quantity with Remaining Balance
            if abs(d['ton_cuoi_sl']) < 0.001 and abs(d['ton_cuoi_val']) > 1 and g != 'OTH-GEN':
                diff_val = d['ton_cuoi_val']
                d['xuat_val_cogs'] += diff_val
                oth['xuat_val_cogs'] -= diff_val
                d['ton_cuoi_val'] = d['ton_dau_val'] + d['nhap_val'] - d['xuat_val_cogs']
                oth['ton_cuoi_val'] = oth['ton_dau_val'] + oth['nhap_val'] - oth['xuat_val_cogs']

            # Fix Negative Value with Positive Quantity
            if d['ton_cuoi_sl'] > 0 and d['ton_cuoi_val'] < 0 and g != 'OTH-GEN':
                unit_price = oth['ton_dau_val'] / oth['ton_dau_sl'] if oth['ton_dau_sl'] > 0 else 500000
                target_val = d['ton_cuoi_sl'] * unit_price
                diff_val = target_val - d['ton_cuoi_val']
                d['nhap_val'] += diff_val
                oth['nhap_val'] -= diff_val
                d['ton_cuoi_val'] = d['ton_dau_val'] + d['nhap_val'] - d['xuat_val_cogs']
                oth['ton_cuoi_val'] = oth['ton_dau_val'] + oth['nhap_val'] - oth['xuat_val_cogs']

        # Propagate to next month
        if m < 12:
            for g in all_groups:
                results['monthly_data'][m+1][g]['ton_dau_sl'] = results['monthly_data'][m][g]['ton_cuoi_sl']
                results['monthly_data'][m+1][g]['ton_dau_val'] = results['monthly_data'][m][g]['ton_cuoi_val']

    return results

def adjust_results_to_targets(results, target_ton_dau, target_nhap, target_xuat_ban, target_xuat_cogs):
    print(f"Adjusting results for {results['year']} to targets...")
    all_groups = results['all_groups']
    
    # 1. Calculate current XNT sums
    curr_xnt_nhap = sum(sum(results['monthly_data'][m][g]['nhap_val'] for m in range(1, 13)) for g in all_groups)
    curr_xnt_xuat_ban = sum(sum(results['monthly_data'][m][g]['xuat_val_ban'] for m in range(1, 13)) for g in all_groups)
    curr_xnt_xuat_cogs = sum(sum(results['monthly_data'][m][g]['xuat_val_cogs'] for m in range(1, 13)) for g in all_groups)
    curr_xnt_ton_dau = sum(results['monthly_data'][1][g]['ton_dau_val'] for g in all_groups)
    
    print(f"Current XNT Sums: Start: {curr_xnt_ton_dau:,.0f}, Nhap: {curr_xnt_nhap:,.0f}, Xuat (Ban): {curr_xnt_xuat_ban:,.0f}, Xuat (Cogs): {curr_xnt_xuat_cogs:,.0f}")
    
    f_nhap = target_nhap / curr_xnt_nhap if curr_xnt_nhap > 0 else 1
    f_xuat_ban = target_xuat_ban / curr_xnt_xuat_ban if curr_xnt_xuat_ban > 0 else 1
    f_xuat_cogs = target_xuat_cogs / curr_xnt_xuat_cogs if curr_xnt_xuat_cogs > 0 else 1
    f_ton_dau = target_ton_dau / curr_xnt_ton_dau if curr_xnt_ton_dau > 0 else 1
    
    # 2. Apply scaling to monthly data
    for g in all_groups:
        results['monthly_data'][1][g]['ton_dau_val'] *= f_ton_dau
        for m in range(1, 13):
            d = results['monthly_data'][m][g]
            d['nhap_val'] *= f_nhap
            d['xuat_val_ban'] *= f_xuat_ban
            d['xuat_val_cogs'] *= f_xuat_cogs
            
    # 3. Recalculate chain before distribution
    for m in range(1, 13):
        for g in all_groups:
            d = results['monthly_data'][m][g]
            if m > 1:
                prev_d = results['monthly_data'][m-1][g]
                d['ton_dau_sl'] = prev_d['ton_cuoi_sl']
                d['ton_dau_val'] = prev_d['ton_cuoi_val']
            d['ton_cuoi_sl'] = d['ton_dau_sl'] + d['nhap_sl'] - d['xuat_sl']
            d['ton_cuoi_val'] = d['ton_dau_val'] + d['nhap_val'] - d['xuat_val_cogs']

    # 4. Distribute OTH-GEN to fix negatives and zero-sl balances
    results = distribute_others(results)

    # Final check on totals
    final_nhap = sum(sum(results['monthly_data'][m][g]['nhap_val'] for m in range(1, 13)) for g in all_groups)
    final_xuat_ban = sum(sum(results['monthly_data'][m][g]['xuat_val_ban'] for m in range(1, 13)) for g in all_groups)
    final_xuat_cogs = sum(sum(results['monthly_data'][m][g]['xuat_val_cogs'] for m in range(1, 13)) for g in all_groups)
    final_ton_dau = sum(results['monthly_data'][1][g]['ton_dau_val'] for g in all_groups)
    print(f"Final XNT Sums: Start: {final_ton_dau:,.0f}, Nhap: {final_nhap:,.0f}, Xuat (Ban): {final_xuat_ban:,.0f}, Xuat (Cogs): {final_xuat_cogs:,.0f}")
    
    # Update reported_sums to match
    for m in range(1, 13):
        results['reported_sums'][m]['muavao'] = sum(results['monthly_data'][m][g]['nhap_val'] for g in all_groups)
        results['reported_sums'][m]['banra'] = sum(results['monthly_data'][m][g]['xuat_val_ban'] for g in all_groups)

    # Update closing_balance for next year
    results['closing_balance'] = {g: {'qty': results['monthly_data'][12][g]['ton_cuoi_sl'], 'val': results['monthly_data'][12][g]['ton_cuoi_val']} for g in all_groups}

    return results

def main():
    engine = create_engine(generate_huyvu_xlsx.DB_URI)
    
    target_ton_dau = 21705995687
    target_nhap = 19811977213
    target_xuat_cogs = 23956750244
    target_xuat_ban = 21855011663
    
    # We must start from the true 2024 closing to keep 2025 opening initial state
    prev_closing = {'OTH-GEN': {'qty': 20000, 'val': 20528682383.0}}
    
    for year in [2023, 2024, 2025]:
        skip_path = f"/chikiet/kata2025/ragketoan/python/skip_lists/skip_list_{year}.json"
        skip_shdons = set()
        if os.path.exists(skip_path):
            with open(skip_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                entries = data.get('skip_entries', []) if isinstance(data, dict) else data
                for s in entries:
                    skip_shdons.add(str(s.get('shdon', s) if isinstance(s, dict) else s))
        
        results = generate_huyvu_xlsx.process_year(year, engine, prev_opening_balance=prev_closing, skip_list=skip_shdons)
        
        if year == 2025:
            results = adjust_results_to_targets(results, target_ton_dau, target_nhap, target_xuat_ban, target_xuat_cogs)
            output_path = "/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025_ADJUSTED.xlsx"
            generate_huyvu_xlsx.save_excel(results, output_path)
            print(f"Generated ADJUSTED file: {output_path}")
            
        if results:
            prev_closing = results['closing_balance']

if __name__ == "__main__":
    main()

