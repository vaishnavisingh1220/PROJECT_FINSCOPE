def validate_kpis(kpis):
    validated = {}

    for k, v in kpis.items():
        if v is None:
            continue

        # remove garbage values
        if v > 1e7:
            continue

        if v < 0 and k != "profit":
            continue

        validated[k] = v

    return validated