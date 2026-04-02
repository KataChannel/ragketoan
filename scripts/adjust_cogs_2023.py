import pandas as pd
import os

def adjust_cogs():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    target_sum = 16154811985
    
    print(f"Loading {src} for COGS adjustment...")
    df = pd.read_excel(src)
    
    # Identify COGS (Dr 632 / Cr 156*)
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)
    
    cogs_mask = (df['TK Nợ'] == '632') & (df['TK Có'].str.startswith('156'))
    current_sum = df[cogs_mask]['Số tiền'].sum()
    
    if current_sum == 0:
        print("Error: No COGS rows found to adjust!")
        return

    print(f"Current COGS: {current_sum:,.0f}")
    print(f"Target COGS: {target_sum:,.0f}")
    
    scale_factor = target_sum / current_sum
    print(f"Scaling factor: {scale_factor:.6f}")
    
    # Apply scaling
    df.loc[cogs_mask, 'Số tiền'] = df.loc[cogs_mask, 'Số tiền'] * scale_factor
    # Round to 0 to avoid floats
    df.loc[cogs_mask, 'Số tiền'] = df.loc[cogs_mask, 'Số tiền'].round(0)
    
    # Final check and adjust last row for rounding errors if needed
    new_sum = df[cogs_mask]['Số tiền'].sum()
    diff = target_sum - new_sum
    if diff != 0:
        last_idx = df[cogs_mask].index[-1]
        df.at[last_idx, 'Số tiền'] = df.at[last_idx, 'Số tiền'] + diff
        
    print(f"✅ Adjusted COGS. Final sum: {df[cogs_mask]['Số tiền'].sum():,.0f}")
    
    # Save
    df.to_excel(src, index=False)
    print(f"Saved to {src}")

if __name__ == "__main__":
    adjust_cogs()
