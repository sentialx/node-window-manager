import { join } from 'path';
import { execFileSync } from 'child_process';

const bin = join(__dirname, '../build/macos');

export const getActiveWindow = () => {
  const process = execFileSync(bin, {encoding: 'utf8'})

  try {
		const result = JSON.parse(process);
		if (result !== null) {
			result.platform = 'macos';
			return result;
		}
	} catch (error) {
		console.error(error);
		throw new Error('Error parsing window data');
	}
};