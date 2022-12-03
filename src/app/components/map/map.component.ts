import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Map, View } from 'ol';
import DayNight from 'ol-ext/source/DayNight';
import Zoom from 'ol/control/Zoom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map: Map | undefined;
  @ViewChild('map') mapRef: ElementRef | undefined;
  baselayer: TileLayer<XYZ> = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    }),
  });
  timeFormControl: FormControl<number> = new FormControl();
  intervalSub: Subscription = new Subscription();

  ngOnInit(): void {
    this.timeFormControl.valueChanges.subscribe((val) => {
      this.onSetNewTime(val);
    });
  }

  ngAfterViewInit(): void {
    this.createInitialMap();
    this.generateDayNightLayer();
    this.intervalSub = interval(30000).subscribe(() => {
      this.generateDayNightLayer();
    });
  }

  onSetNewTime(hoursAheadOfCurrent: number) {
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
    }
    this.generateDayNightLayer(this.getTimeAhead(hoursAheadOfCurrent));
  }

  createInitialMap() {
    this.map = new Map({
      controls: [],
      target: this.mapRef?.nativeElement,
      layers: [this.baselayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 1,
      }),
    });
    this.map.addControl(new Zoom());
  }

  generateDayNightLayer(time?: Date) {
    let dayNightLayer: VectorLayer<VectorSource> = new VectorLayer({
      source: new DayNight({
        time: time ? time : new Date(),
      }),
      style: new Style({
        fill: new Fill({
          color: [0, 0, 50, 0.5],
        }),
      }),
      properties: {
        isDayNightLayer: true,
      },
    });
    this.map
      ?.getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer.get('isDayNightLayer')) {
          this.map?.removeLayer(layer);
        }
      });
    this.map?.addLayer(dayNightLayer);
  }

  formatThumbLabel(value: number): string {
    // TODO this formatter should also use getTimeAhead()
    let currentDate: Date = new Date();
    currentDate.setTime(currentDate.getTime() + value * 3600000);
    return formatDate(currentDate.getTime(), 'h:mm', 'en');
  }

  getTimeAhead(hoursAheadOfCurrent: number): Date {
    let currentDate: Date = new Date();
    currentDate.setTime(currentDate.getTime() + hoursAheadOfCurrent * 3600000);
    return currentDate;
  }
}
