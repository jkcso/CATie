def reformat_for_url(s):
    # remove leading/trailing whitespace
    stripped = s.lstrip().rstrip()
    # replace ' ' with '-'
    t = '-'.join(stripped.split())
    # remove punctuation
    u = ''.join([c for c in t if c.isalnum() or c == '-'])
    # make lowercase
    return u.lower()
