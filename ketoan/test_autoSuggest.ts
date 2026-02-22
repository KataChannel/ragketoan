import { autoSuggestGrouping } from './app/services/training.service';

async function main() {
  const suggest = await autoSuggestGrouping(undefined, (percent, msg) => {
    console.log(`[${percent}%] ${msg}`);
  });
  console.log('Got suggestions count:', suggest?.length);
  if (suggest && suggest.length > 0) {
    console.log('Sample:', JSON.stringify(suggest[0], null, 2));
  }
}

main().catch(console.error).finally(() => process.exit());
