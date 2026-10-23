#!/usr/bin/env python3
"""Index Markdown news and copy the site for deployment. No compilation/dependencies."""
import argparse
from datetime import date
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]


def metadata(text, path):
    match = re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)', text, re.S)
    if not match:
        raise ValueError(f'{path}: falta la cabecera entre líneas ---')
    data = {}
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        key, sep, value = line.partition(':')
        if not sep or not re.fullmatch(r'[a-z_]+', key.strip()):
            raise ValueError(f'{path}: metadato no válido: {line}')
        key, value = key.strip(), value.strip()
        if key in data:
            raise ValueError(f'{path}: metadato repetido: {key}')
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ['"', "'"]:
            value = value[1:-1]
        data[key] = value
    for key in ('titulo', 'fecha', 'categoria', 'resumen'):
        if not data.get(key):
            raise ValueError(f'{path}: falta {key}')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', data['fecha']):
        raise ValueError(f'{path}: fecha debe usar AAAA-MM-DD')
    date.fromisoformat(data['fecha'])
    if 'borrador' in data and data['borrador'].lower() not in ('true', 'false'):
        raise ValueError(f'{path}: borrador debe ser true o false')
    if not text[match.end():].strip():
        raise ValueError(f'{path}: la noticia no tiene contenido')
    image = data.get('imagen', '')
    if image and not (image.startswith('assets/') or image.startswith('https://')):
        raise ValueError(f'{path}: imagen debe comenzar por assets/ o https://')
    if image.startswith('assets/'):
        target=(ROOT/image).resolve()
        if not target.is_relative_to((ROOT/'assets').resolve()) or not target.is_file():
            raise ValueError(f'{path}: la imagen local no existe o sale de assets/')
    return data


def news_index():
    result = []
    for path in sorted((ROOT/'content/noticias').glob('*.md')):
        if path.is_symlink():
            raise ValueError(f'{path}: no se permiten enlaces simbólicos')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', path.stem):
            raise ValueError(f'{path}: utiliza un nombre sin espacios, con minúsculas y guiones')
        data = metadata(path.read_text(encoding='utf-8'), path.name)
        if data.get('borrador', 'false').lower() == 'true':
            continue
        result.append({key: data[key] for key in ('titulo', 'fecha', 'categoria', 'resumen', 'imagen', 'imagen_alt') if key in data} | {'slug': path.stem, 'archivo': path.relative_to(ROOT).as_posix()})
    result.sort(key=lambda n: (n['fecha'], n['slug']), reverse=True)
    return result


def validate_members():
    text = (ROOT/'content/colegiados.md').read_text(encoding='utf-8')
    lines = [line.strip() for line in text.splitlines() if line.strip().startswith('|')]
    expected = ['Nombre', 'Primer Apellido', 'Segundo Apellido', 'Nº Colegiado', 'Titulación', 'Servicios', 'Provincia', 'Teléfono', 'Email']
    if len(lines) < 2:
        raise ValueError('colegiados.md: falta la tabla Markdown')
    cells = lambda line: [c.strip() for c in line.strip('|').split('|')]
    if cells(lines[0]) != expected:
        raise ValueError('colegiados.md: conserva los nueve encabezados y su orden')
    if not all(re.fullmatch(r':?-{3,}:?', cell) for cell in cells(lines[1])) or len(cells(lines[1])) != 9:
        raise ValueError('colegiados.md: separador de encabezados inválido')
    numbers=set()
    for num,line in enumerate(lines[2:],3):
        row=cells(line)
        if len(row)!=9:
            raise ValueError(f'colegiados.md, fila {num}: debe tener 9 columnas')
        if not row[3].isdigit() or row[3] in numbers:
            raise ValueError(f'colegiados.md, fila {num}: número colegial vacío, inválido o repetido')
        numbers.add(row[3])
    return len(numbers)


def prepare(destination=None):
    news=news_index()
    count=validate_members()
    index=json.dumps(news,ensure_ascii=False,indent=2)+'\n'
    (ROOT/'content/noticias/index.json').write_text(index,encoding='utf-8')
    if destination:
        output=Path(destination).resolve()
        if output==ROOT or output in ROOT.parents:
            raise ValueError('La salida no puede sustituir el proyecto o sus directorios superiores')
        output.mkdir(parents=True,exist_ok=True)
        # Fresh copy, so removed news and draft-only media cannot survive a deployment.
        for name in ('assets','content'):
            target=output/name
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(ROOT/name,target)
        shutil.copy2(ROOT/'index.html',output/'index.html')
        shutil.copy2(ROOT/'404.html',output/'404.html')
        (output/'.nojekyll').write_text('')
        for path in (output/'content/noticias').glob('*.md'):
            if not any(n['slug']==path.stem for n in news):
                path.unlink()
    print(f'Validado: {len(news)} noticias, {count} colegiados. Sin compilación.')
    return news,count


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',help='Carpeta de publicación, por ejemplo _site')
    args=parser.parse_args()
    prepare(args.output)
