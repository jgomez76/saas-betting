export function format(
    text: string,
    values: Record<string, string | number>
): string {

    let result = text;

    Object.entries(values).forEach(([key, value]) => {

        result = result.replace(
            `{${key}}`,
            String(value)
        );

    });

    return result;

}