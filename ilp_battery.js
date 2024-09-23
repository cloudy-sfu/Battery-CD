function define_ilp_battery(D, C, A0, I, O, E) {
    /*
    Let m be the number of batteries; let n be the number of hours.
    D: demand curve (size: n)
    C: batteries' energy capacity (size: m)
    A0: initial level of batteries (size: m)
    I: maximum input power of batteries (size: m)
    O: maximum output power of batteries (size: m)
    E: charging efficiency
     */
    const m = C.length;
    const n = D.length;
    let model = {
        "optimize": "z",
        "opType": "min",
        "constraints": {},
        "variables": {},
        "ints": {},
        "options": {},
    }
    for (let i = 0; i < m; i++) {
        // var A_ij (j=0): amount of remained energy in the battery
        model['variables'][`A_${i}_0`] = {};
        model['variables'][`A_${i}_0`][`A_${i}_0`] = 1;
        model['constraints'][`A_${i}_0`] = {"min": 0};
        // constraint: initial of energy balance
        model['variables'][`A_${i}_0`][`eb_${i}`] = 1;
        model['constraints'][`eb_${i}`] = {"equal": A0[i]};
    }
    for (let j = 0; j < n; j++) {
        // var t_j: outage amount
        model['variables'][`t_${j}`] = {};
        model['constraints'][`t_${j}`] = {"min": 0};
        // objective function: penalize outage t_j
        model['variables'][`t_${j}`]['z'] = 1;
        // constraint: outage
        model['variables'][`t_${j}`][`outage_${j}`] = 1;
        model['constraints'][`outage_${j}`] = {"min": D[j]};
        for (let i = 0; i < m; i++) {
            // var P_ij: amount of discharging
            model['variables'][`P_${i}_${j}`] = {};
            model['variables'][`P_${i}_${j}`][`P_${i}_${j}`] = 1;
            model['constraints'][`P_${i}_${j}`] = {"min": 0};
            // var A_ij (j>0): amount of remained energy in the battery
            model['variables'][`A_${i}_${j+1}`] = {};
            model['variables'][`A_${i}_${j+1}`][`A_${i}_${j+1}`] = 1;
            model['constraints'][`A_${i}_${j+1}`] = {"min": 0};
            // var H_ij: amount of charging
            model['variables'][`H_${i}_${j}`] = {};
            model['variables'][`H_${i}_${j}`][`H_${i}_${j}`] = 1;
            model['constraints'][`H_${i}_${j}`] = {"min": 0};
            // var Sc_ij: charging status
            model['variables'][`Sc_${i}_${j}`] = {};
            model['ints'][`Sc_${i}_${j}`] = 1;
            model['variables'][`Sc_${i}_${j}`][`Sc_b_${i}_${j}`] = 1;
            model['constraints'][`Sc_b_${i}_${j}`] = {"max": 1, "min": 0};
            // var Sd_ij: discharging status
            model['variables'][`Sd_${i}_${j}`] = {};
            model['ints'][`Sd_${i}_${j}`] = 1;
            model['variables'][`Sd_${i}_${j}`][`Sd_b_${i}_${j}`] = 1;
            model['constraints'][`Sd_b_${i}_${j}`] = {"min": 0, "max": 1};
            // constraint: outage
            model['variables'][`P_${i}_${j}`][`outage_${j}`] = 1;
            // constraint: energy balance
            // - P(i, j) + E(i) H(i, j) + A(i, j) = A(i, j+1)
            model['variables'][`A_${i}_${j+1}`][`eb_${i}_${j}`] = -1;
            model['variables'][`P_${i}_${j}`][`eb_${i}_${j}`] = -1;
            model['variables'][`H_${i}_${j}`][`eb_${i}_${j}`] = E[i];
            model['variables'][`A_${i}_${j}`][`eb_${i}_${j}`] = 1;
            model['constraints'][`eb_${i}_${j}`] = {"equal": 0};
            // constraint: charging status
            model['variables'][`H_${i}_${j}`][`c_st_${i}_${j}`] = 1;
            model['variables'][`Sc_${i}_${j}`][`c_st_${i}_${j}`] = -I[i];
            model['constraints'][`c_st_${i}_${j}`] = {"max": 0};
            // constraint: charging max capacity
            model['variables'][`A_${i}_${j}`][`c_cap_${i}_${j}`] = 1;
            model['constraints'][`c_cap_${i}_${j}`] = {"max": C[i]};
            // constraint: charging source availability
            model['variables'][`H_${i}_${j}`][`c_avl_${j}`] = 1;
            // constraint: discharging max capacity
            model['variables'][`P_${i}_${j}`][`d_cap_${i}_${j}`] = 1;
            model['variables'][`A_${i}_${j}`][`d_cap_${i}_${j}`] = -1;
            model['constraints'][`d_cap_${i}_${j}`] = {"max": 0};
            // constraint: discharge status
            model['variables'][`P_${i}_${j}`][`d_st_${i}_${j}`] = 1;
            model['variables'][`Sd_${i}_${j}`][`d_st_${i}_${j}`] = -O[i];
            model['constraints'][`d_st_${i}_${j}`] = {"max": 0};
            // constraint: cannot charge and discharge at the same slot
            model['variables'][`Sc_${i}_${j}`][`cd_iso_${i}_${j}`] = 1;
            model['variables'][`Sd_${i}_${j}`][`cd_iso_${i}_${j}`] = 1;
            model['constraints'][`cd_iso_${i}_${j}`] = {"max": 1};
        }
        // constraint: charging availability
        model['constraints'][`c_avl_${j}`] = {"max": Math.max(0, - D[j])};
    }
    return model;
}
