#!/usr/bin/env python3
"""Liste ce qu'il reste à compléter ou à valider avant de diffuser le lien.
Usage : python tools/pre-publication.py   (rien n'est bloquant : le site fonctionne tel quel)"""
import json,pathlib
r=pathlib.Path(__file__).resolve().parent.parent
D=json.load(open(r/'data/content.json',encoding='utf-8'));c=D['cfg'];fr=D['fr'];todo=[];val=[]
for k,m in [('email',"bouton « M'écrire » masqué"),('cv','bouton « Télécharger mon CV » masqué'),('portrait','pas de portrait dans l\'ouverture')]:
    if not c.get(k):todo.append(f'cfg.{k} vide : {m}')
    elif k=='cv' and not (r/c[k]).exists():todo.append(f'cfg.cv pointe vers un fichier absent : {c[k]}')
if not any(p.get('s') for p in fr['ph']):todo.append('aucune photo dans la galerie (section masquée)')
for p in fr['pj']:
    if not p.get('det'):todo.append(f"projet « {p['id']} » en mode aperçu (voir FICHE-PROJET.md)")
for k in c.get('chk',[]):val.append(f"texte ui « {k} » : {fr['ui'].get(k,'')[:70]}…")
for sec,lab in [('tl','parcours'),('pj','projet'),('ld','engagement')]:
    for x in fr[sec]:
        if x.get('chk'):val.append(f"{lab} : {x.get('t') or x.get('n')}")
print('À COMPLÉTER');print('\n'.join('  • '+x for x in todo) or '  rien')
print('\nÀ VALIDER (surligné avec ?check=1)');print('\n'.join('  • '+x for x in val) or '  rien')
