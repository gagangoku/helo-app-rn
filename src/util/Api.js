
// TODO: Fixit
export const getPersonNamesByRoleId = async (members) => {
    const map = {};
    members.forEach(m => {
        map[m] = {
            person: {
                name: m,
            },
        };
    });
    return map;
};
