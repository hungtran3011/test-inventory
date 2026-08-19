export function numberToVietnameseText(number: number): string {
    if (number === 0) return 'Không đồng';
    
    const units = ['', 'nghìn', 'triệu', 'tỉ', 'nghìn tỉ', 'triệu tỉ'];
    const numbers = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    
    function readGroup(group: number, full: boolean): string {
        let result = '';
        const hundred = Math.floor(group / 100);
        const ten = Math.floor((group % 100) / 10);
        const unit = group % 10;
        
        if (full || hundred > 0) {
            result += numbers[hundred] + ' trăm ';
        }
        
        if (ten === 0) {
            if (full || hundred > 0) {
                if (unit > 0) result += 'lẻ ' + numbers[unit] + ' ';
            } else {
                if (unit > 0) result += numbers[unit] + ' ';
            }
        } else if (ten === 1) {
            result += 'mười ';
            if (unit === 5) result += 'lăm ';
            else if (unit > 0) result += numbers[unit] + ' ';
        } else {
            result += numbers[ten] + ' mươi ';
            if (unit === 1) result += 'mốt ';
            else if (unit === 5) result += 'lăm ';
            else if (unit > 0) result += numbers[unit] + ' ';
        }
        
        return result.trim();
    }
    
    let str = '';
    let num = number;
    let unitIndex = 0;
    
    do {
        const group = num % 1000;
        num = Math.floor(num / 1000);
        
        if (group > 0) {
            const groupText = readGroup(group, num > 0);
            str = groupText + ' ' + units[unitIndex] + ' ' + str;
        }
        unitIndex++;
    } while (num > 0);
    
    str = str.trim().replace(/\s+/g, ' ') + ' đồng chẵn';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
